import { Request, Response } from "express";
import { pool } from "../../db";
import bcrypt from "bcrypt";
import genToken from "../../utils/authentication/genToken";
import retrieveWhopMembership from "../../utils/authentication/retrieveWhopMembership";

async function login(req: Request, res: Response) {
  if (req.body.username && req.body.password) {
    const pullUser = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [req.body.username]
    );
      
    if (pullUser.rowCount > 0) {
      const comparePassword = await bcrypt.compare(
        req.body.password,
        pullUser.rows[0].password
      );

      if (comparePassword) {
        //Whop Check Membership
        if (pullUser.rows[0].license_key != null) {
          const getMembership = await retrieveWhopMembership(
            pullUser.rows[0].license_key
          );
                        
          if (getMembership.data.metadata && Object.keys(getMembership.data.metadata).length !== 0) {
            const metadata = getMembership.data.metadata;
            if (
              metadata.userId === pullUser.rows[0].id &&
              (getMembership.data.status === "active" ||
                getMembership.data.status === "trialing")
            ) {
              let premium = false;
              if (getMembership.data.product === "prod_pkivS8LRwwj1I") {
                premium = true;
              }
              const token = genToken(
                pullUser.rows[0].id,
                pullUser.rows[0].username,
                pullUser.rows[0].license_key,
                premium
              );
              res.status(200).json({
                success: true,
                data: {
                  jwt: token,
                },
              });
            } else {
              res.status(400).json({
                success: false,
                msg: "Not your license key, or invalid key",
              });
            }
          } else {
            res.status(400).json({
              success: false,
              msg: "Not your license key, or invalid key",
            });
          }
        } else {
          const token = genToken(
            pullUser.rows[0].id,
            pullUser.rows[0].username,
            undefined,
            false
          );
            
            res.status(200).json({
                success: true,
                data: {
                    jwt: token
                }
            })
        }
      } else {
        res.status(400).json({
          success: false,
          msg: "Username or password is invalid.",
        });
      }
    } else {
      res.status(400).json({
        success: false,
        msg: "Username or password is invalid.",
      });
    }
  } else {
    res.status(400).json({
      success: false,
      msg: "Username and Password are required.",
    });
  }
}

export { login };
