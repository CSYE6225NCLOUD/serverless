// const sgMail = require("@sendgrid/mail");

// // Load SendGrid API Key
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// exports.handler = async (event) => {
//   try {
//     const snsMessage = JSON.parse(event.Records[0].Sns.Message);

//     // Email payload
//     const emailOptions = {
//       to: snsMessage.email,
//       from: process.env.SENDGRID_FROM_EMAIL,
//       subject: "Email Verification",
//       text: `Click the following link to verify your email: ${snsMessage.verification_link}`,
//       html: `<p>Click the following link to verify your email:</p><a href="${snsMessage.verification_link}">${snsMessage.verification_link}</a>`,
//     };

//     // Send email
//     await sgMail.send(emailOptions);
//     console.log(`Verification email sent to ${snsMessage.email}`);
//     return {
//       statusCode: 200,
//       body: JSON.stringify({ message: "Email sent successfully" }),
//     };
//   } catch (error) {
//     console.error("Error processing SNS message or sending email:", error);
//     throw new Error("Lambda processing failed");
//   }
// };

const AWS = require("aws-sdk");
const sgMail = require("@sendgrid/mail");

exports.handler = async (event) => {
  try {
    const secretsManager = new AWS.SecretsManager();

    // Retrieve email credentials from Secrets Manager
    console.log("Fetching email credentials from Secrets Manager...");
    const secretValue = await secretsManager
      .getSecretValue({ SecretId: process.env.EMAIL_SECRET_ID })
      .promise();

    const credentials = JSON.parse(secretValue.SecretString);
    console.log("Email credentials retrieved successfully.");

    // Set SendGrid API key
    sgMail.setApiKey(credentials.SENDGRID_API_KEY);

    // Parse SNS message
    console.log("Parsing SNS message...");
    const snsMessage = JSON.parse(event.Records[0].Sns.Message);

    // Validate SNS message structure
    if (!snsMessage.email || !snsMessage.verification_link) {
      throw new Error(
        "Invalid SNS message: Missing email or verification link."
      );
    }

    // Email payload
    const emailOptions = {
      to: snsMessage.email,
      from: credentials.SENDGRID_FROM_EMAIL,
      subject: "Email Verification",
      text: `Click the following link to verify your email: ${snsMessage.verification_link}`,
      html: `<p>Click the following link to verify your email:</p><a href="${snsMessage.verification_link}">${snsMessage.verification_link}</a>`,
    };

    // Send email
    console.log(`Sending email to ${snsMessage.email}...`);
    await sgMail.send(emailOptions);
    console.log(`Verification email sent to ${snsMessage.email}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email sent successfully" }),
    };
  } catch (error) {
    console.error("Error processing SNS message or sending email:", error);
    throw new Error("Lambda processing failed");
  }
};
