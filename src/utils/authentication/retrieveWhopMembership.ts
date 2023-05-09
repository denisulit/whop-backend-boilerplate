import axios, { AxiosError } from "axios";

export default async function retrieveWhopMembership(id: string) {
  try {
    const req = await axios.get(`https://api.whop.com/api/v2/memberships/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.WHOP_MEMBERSHIP_API,
      },
    });
    return req;
  } catch (e: AxiosError | any) {
    return e;
  }
}
