import sendEmail from "aws-sdk-plus/dist/sendEmail";
import type { AxiosError } from "axios";
import React from "react";

const emailError = (subject: string, e: AxiosError): Promise<string> =>
  sendEmail({
    to: process.env.ROAMJS_EMAIL,
    from: "support@roamjs.com",
    subject: `RoamJS Error: ${subject}`,
    body: React.createElement(
      "div",
      {
        style: {
          margin: "0 auto",
          maxWidth: 600,
          fontFamily: `"Proxima Nova","proxima-nova",Helvetica,Arial sans-serif`,
          padding: `20px 0`,
        },
      },
      React.createElement(
        "div",
        {
          style: {
            width: "80%",
            margin: "0 auto",
            paddingBottom: 20,
            borderBottom: "1px dashed #dadada",
            textAlign: "center",
          },
        },
        React.createElement("img", {
          src: "https://roamjs.com/images/logo-low-res.png",
        })
      ),
      React.createElement(
        "div",
        {
          style: {
            width: "80%",
            margin: "30px auto",
            fontSize: 16,
          },
        },
        React.createElement("h1", {}, `An error was thrown in a RoamJS Lambda`),
        React.createElement(
          "p",
          {},
          `${e.name}: ${
            typeof e.response?.data === "object"
              ? e.response.data.message || JSON.stringify(e.response.data)
              : e.response?.data || e.message
          }`
        ),
        React.createElement("p", {}, e.stack)
      ),
      React.createElement(
        "div",
        {
          style: {
            width: "80%",
            margin: "30px auto",
            borderTop: "1px dashed #dadada",
            display: "flex",
            color: "#a8a8a8",
            paddingTop: 15,
          },
        },
        React.createElement(
          "div",
          { style: { width: "50%" } },
          "Sent From ",
          React.createElement(
            "a",
            {
              href: "https://roamjs.com",
              style: { color: "#3ba4dc", textDecoration: "none" },
            },
            "RoamJS"
          )
        ),
        React.createElement(
          "div",
          { style: { width: "50%", textAlign: "right" } },
          React.createElement(
            "a",
            {
              href: "mailto:support@roamjs.com",
              style: { color: "#3ba4dc", textDecoration: "none" },
            },
            "Contact Support"
          )
        )
      )
    ),
  });

export default emailError;
