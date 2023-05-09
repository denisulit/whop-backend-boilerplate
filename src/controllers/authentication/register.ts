import { Request, Response } from "express";
import { nanoid } from "nanoid";
import { pool } from "../../db";
import axios, { AxiosError } from "axios";
import genToken from "../../utils/authentication/genToken";
import bcrypt from 'bcrypt';

async function completeRegister(
  req: Request,
  res: Response,
  id: string,
  username: string,
  password: string,
  licenseKey?: string,
  premium?: boolean
) {
  try {
    const insert = await pool.query(
      "INSERT INTO users (id, username, password, license_key) VALUES ($1, $2, $3, $4)",
      [id, username, password, licenseKey]
    );

    if (insert.rowCount > 0) {
      const token = genToken(id, username, licenseKey, premium);

      res.status(200).json({
        success: true,
        data: {
          token: token,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        msg: "Databse insert failed, sorry about that. Please try again or let support know.",
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      msg: "Databse insert failed, sorry about that. Please try again or let support know.",
    });
  }
}

async function register(req: Request, res: Response) {
  if (req.body.username && req.body.password) {
    if (req.body.username.length > 3 && req.body.username.length < 20) {
      if (req.body.password.length > 5 && req.body.password.length < 40) {
        const checkUsername = await pool.query(
          "SELECT id FROM users WHERE username = $1",
          [req.body.username]
        );
        if (checkUsername.rowCount == 0) {
          const id: string = "user_" + nanoid(15);
          const hash: string = await bcrypt.hash(req.body.password, 12);
          const licenseKey: string | boolean = req.body.licenseKey || false;

          if (licenseKey) {
            const checkKey = await pool.query(
              "SELECT license_key FROM users WHERE license_key = $1",
              [req.body.licenseKey]
            );

            if (checkKey.rowCount == 0) {
              //do whop request to validate key
              try {
                const validateLicenseKey = await axios.post(
                  `https://api.whop.com/api/v2/memberships/${licenseKey}/validate_license`,
                  {
                    metadata: {
                      userId: id,
                    },
                  },
                  {
                    headers: {
                      "Content-Type": "application/json",
                      Authorization:
                        "Bearer " + process.env.WHOP_MEMBERSHIP_API,
                    },
                  }
                );

                if (validateLicenseKey.status === 201) {
                  if (
                    validateLicenseKey.data.status === "active" ||
                    validateLicenseKey.data.status === "trialing"
                  ) {
                    if (
                      validateLicenseKey.data.product === "prod_pkivS8LRwwj1I"
                    ) {
                      completeRegister(
                        req,
                        res,
                        id,
                        req.body.username,
                        hash,
                        validateLicenseKey.data.license_key || licenseKey,
                        true
                      );
                    } else {
                      completeRegister(
                        req,
                        res,
                        id,
                        req.body.username,
                        hash,
                        validateLicenseKey.data.license_key || licenseKey
                      );
                    }
                  } else {
                    res.status(400).json({
                      success: false,
                      msg: "Your membership is not active, please get a new license key.",
                    });
                  }
                } else {
                  res.status(400).json({
                    success: false,
                    msg: "Invalid License Key",
                  });
                }
              } catch (e: AxiosError | any) {
                if (
                  e.response.data.error.message ===
                  "Please reset your key to use on a new machine"
                ) {
                  res.status(400).json({
                    success: false,
                    msg: "Trying to be sneaky??? We detect the use of others license keys.",
                  });
                } else {
                  res.status(400).json({
                    success: false,
                    msg: "License Key validation request failed.",
                  });
                }
              }
            } else {
              res.status(400).json({
                success: false,
                msg: "Trying to be sneaky??? We detect the use of others license keys.",
              });
            }
          } else {
            completeRegister(req, res, id, req.body.username, hash);
          }
        } else {
          res.status(400).json({
            success: false,
            msg: "Sorry this username is taken.",
          });
        }
      } else {
        res.status(400).json({
          success: false,
          msg: "Password has to be more than 5 characters and less than 40.",
        });
      }
    } else {
      res.status(400).json({
        success: false,
        msg: "Username has to be more than 3 characters and less than 20.",
      });
    }
  } else {
    res.status(400).json({
      success: false,
      msg: "Not all required fields were submitted.",
    });
  }
}

export { register };
