require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const db = require("./db");

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const app = express();

/* ================= PROFILE PHOTO UPLOAD ================= */

const profileUploadDir = path.join(
  __dirname,
  "uploads",
  "profile"
);

if (!fs.existsSync(profileUploadDir)) {
  fs.mkdirSync(profileUploadDir, {
    recursive: true,
  });
}

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileUploadDir);
  },

  filename: (req, file, cb) => {
    const userId = req.user?.id || "user";
    const extension = path.extname(file.originalname).toLowerCase();

    cb(
      null,
      `profile-${userId}-${Date.now()}${extension}`
    );
  },
});

const profileUpload = multer({
  storage: profileStorage,

  limits: {
    fileSize: 2 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only JPG, PNG and WEBP images are allowed"
        )
      );
    }
  },
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());
app.use(express.json());

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

/* ================= AUTH MIDDLEWARE ================= */

const authenticateToken = (req, res, next) => {
  const authHeader =
    req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Please login first",
    });
  }

  const token =
    authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

/* ================= HOME ================= */

app.get("/", (req, res) => {
  res.json({
    message: "Online Test API is running 🚀",
  });
});

/* ================= REGISTER OTP ================= */

/* SEND REGISTRATION OTP */

app.post("/api/register/send-otp", async (req, res) => {
  try {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({
        message: "Full name and email are required",
      });
    }

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    /* CHECK EMAIL FORMAT */

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please enter a valid Gmail address",
      });
    }

    /* ONLY GMAIL */

    if (!cleanEmail.endsWith("@gmail.com")) {
      return res.status(400).json({
        message: "Please use a Gmail address",
      });
    }

    /* CHECK EXISTING USER */

    db.query(
      "SELECT id FROM users WHERE email = ?",
      [cleanEmail],
      (err, results) => {
        if (err) {
          console.log("CHECK USER ERROR:", err);

          return res.status(500).json({
            message: "Database error",
          });
        }

        if (results.length > 0) {
          return res.status(409).json({
            message: "Email already registered",
          });
        }

        /* GENERATE OTP */

        const otp = Math.floor(
          100000 + Math.random() * 900000
        ).toString();

        /* OTP EXPIRES IN 10 MINUTES */

        const expiresAt = new Date(
          Date.now() + 10 * 60 * 1000
        );

        /* DELETE OLD OTP */

        db.query(
          "DELETE FROM registration_otps WHERE email = ?",
          [cleanEmail],
          (deleteErr) => {
            if (deleteErr) {
              console.log(
                "DELETE OLD OTP ERROR:",
                deleteErr
              );

              return res.status(500).json({
                message: "Unable to process OTP",
              });
            }

            /* SAVE NEW OTP */

            const insertSql = `
              INSERT INTO registration_otps
              (full_name, email, otp, expires_at)
              VALUES (?, ?, ?, ?)
            `;

            db.query(
              insertSql,
              [
                cleanName,
                cleanEmail,
                otp,
                expiresAt,
              ],
              async (insertErr) => {
                if (insertErr) {
                  console.log(
                    "SAVE OTP ERROR:",
                    insertErr
                  );

                  return res.status(500).json({
                    message:
                      "Unable to generate OTP",
                  });
                }

                /* SEND EMAIL */

                try {
                  await transporter.sendMail({
                    from: `"TestHub" <${process.env.EMAIL_USER}>`,
                    to: cleanEmail,
                    subject:
                      "🔐 TestHub Registration Verification OTP",

                    html: `
                      <div style="
                        font-family: Arial, sans-serif;
                        max-width: 600px;
                        margin: auto;
                        padding: 30px;
                        background: #f7f8fc;
                      ">

                        <div style="
                          background: white;
                          padding: 30px;
                          border-radius: 16px;
                          text-align: center;
                          border: 1px solid #e5e7eb;
                        ">

                          <div style="
                            font-size: 42px;
                            margin-bottom: 10px;
                          ">
                            🎓
                          </div>

                          <h1 style="
                            color: #4f46e5;
                            margin-bottom: 8px;
                          ">
                            Welcome to TestHub
                          </h1>

                          <p style="
                            color: #555;
                            font-size: 15px;
                          ">
                            Hello <strong>${cleanName}</strong>,
                          </p>

                          <p style="
                            color: #666;
                            font-size: 15px;
                          ">
                            Use the verification code below
                            to verify your Gmail address.
                          </p>

                          <div style="
                            margin: 25px 0;
                            padding: 18px;
                            background: #f1efff;
                            border-radius: 12px;
                            font-size: 32px;
                            font-weight: bold;
                            letter-spacing: 8px;
                            color: #4f46e5;
                          ">
                            ${otp}
                          </div>

                          <p style="
                            color: #777;
                            font-size: 14px;
                          ">
                            This OTP is valid for
                            <strong>10 minutes</strong>.
                          </p>

                          <p style="
                            color: #999;
                            font-size: 12px;
                            margin-top: 25px;
                          ">
                            If you did not request this,
                            please ignore this email.
                          </p>

                          <hr style="
                            border: none;
                            border-top: 1px solid #eee;
                            margin: 25px 0;
                          ">

                          <p style="
                            color: #777;
                            font-size: 13px;
                          ">
                            © 2026 TestHub
                          </p>

                        </div>

                      </div>
                    `,
                  });

                  res.status(200).json({
                    message:
                      "Verification OTP sent successfully",
                  });

                } catch (emailError) {
                  console.log(
                    "SEND OTP EMAIL ERROR:",
                    emailError
                  );

                  return res.status(500).json({
                    message:
                      "Unable to send OTP email",
                  });
                }
              }
            );
          }
        );
      }
    );

  } catch (error) {
    console.log(
      "SEND REGISTRATION OTP ERROR:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
});


/* VERIFY REGISTRATION OTP */

app.post("/api/register/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      message: "Email and OTP are required",
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanOtp = otp.trim();

  db.query(
    `
      SELECT *
      FROM registration_otps
      WHERE email = ?
      AND otp = ?
      AND verified = FALSE
      ORDER BY id DESC
      LIMIT 1
    `,
    [cleanEmail, cleanOtp],
    (err, results) => {
      if (err) {
        console.log(
          "VERIFY OTP ERROR:",
          err
        );

        return res.status(500).json({
          message: "Database error",
        });
      }

      if (results.length === 0) {
        return res.status(400).json({
          message:
            "Invalid OTP. Please check and try again.",
        });
      }

      const otpRecord = results[0];

      /* CHECK EXPIRY */

      if (
        new Date(otpRecord.expires_at) <
        new Date()
      ) {
        return res.status(400).json({
          message:
            "OTP has expired. Please request a new OTP.",
        });
      }

      /* MARK VERIFIED */

      db.query(
        `
          UPDATE registration_otps
          SET verified = TRUE
          WHERE id = ?
        `,
        [otpRecord.id],
        (updateErr) => {
          if (updateErr) {
            console.log(
              "UPDATE OTP ERROR:",
              updateErr
            );

            return res.status(500).json({
              message: "Unable to verify OTP",
            });
          }

          res.status(200).json({
            message:
              "Email verified successfully",
            verified: true,
          });
        }
      );
    }
  );
});


/* CREATE ACCOUNT */

app.post("/api/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    /* PASSWORD MATCH */

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    /* PASSWORD LENGTH */

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });
    }

    /* CHECK VERIFIED OTP */

    db.query(
      `
        SELECT *
        FROM registration_otps
        WHERE email = ?
        AND verified = TRUE
        ORDER BY id DESC
        LIMIT 1
      `,
      [cleanEmail],
      async (otpErr, otpResults) => {
        if (otpErr) {
          console.log(
            "CHECK VERIFIED OTP ERROR:",
            otpErr
          );

          return res.status(500).json({
            message: "Database error",
          });
        }

        if (otpResults.length === 0) {
          return res.status(403).json({
            message:
              "Please verify your email first",
          });
        }

        const otpRecord = otpResults[0];

        /* CHECK OTP EXPIRY */

        if (
          new Date(otpRecord.expires_at) <
          new Date()
        ) {
          return res.status(400).json({
            message:
              "Verification expired. Please verify your email again.",
          });
        }

        /* CHECK USER AGAIN */

        db.query(
          "SELECT id FROM users WHERE email = ?",
          [cleanEmail],
          async (userErr, users) => {
            if (userErr) {
              console.log(
                "CHECK USER ERROR:",
                userErr
              );

              return res.status(500).json({
                message: "Database error",
              });
            }

            if (users.length > 0) {
              return res.status(409).json({
                message:
                  "Email already registered",
              });
            }

            /* HASH PASSWORD */

            const hashedPassword =
              await bcrypt.hash(password, 10);

            /* CREATE USER */

            const insertSql = `
              INSERT INTO users
              (name, email, password)
              VALUES (?, ?, ?)
            `;

            db.query(
              insertSql,
              [
                cleanName,
                cleanEmail,
                hashedPassword,
              ],
              async (insertErr, result) => {
                if (insertErr) {
                  console.log(
                    "CREATE USER ERROR:",
                    insertErr
                  );

                  return res.status(500).json({
                    message:
                      "Registration failed",
                  });
                }

                /* SEND WELCOME EMAIL */

                try {
                  await transporter.sendMail({
                    from: `"TestHub" <${process.env.EMAIL_USER}>`,
                    to: cleanEmail,

                    subject:
                      "🎉 Welcome to TestHub – Registration Successful",

                    html: `
                      <div style="
                        font-family: Arial, sans-serif;
                        max-width: 600px;
                        margin: auto;
                        padding: 30px;
                        background: #f7f8fc;
                      ">

                        <div style="
                          background: white;
                          padding: 35px;
                          border-radius: 16px;
                          border: 1px solid #e5e7eb;
                        ">

                          <div style="
                            text-align: center;
                            font-size: 45px;
                          ">
                            🎉
                          </div>

                          <h1 style="
                            text-align: center;
                            color: #4f46e5;
                          ">
                            Welcome to TestHub!
                          </h1>

                          <p style="
                            color: #333;
                            font-size: 16px;
                          ">
                            Hello <strong>${cleanName}</strong>,
                          </p>

                          <p style="
                            color: #555;
                            line-height: 1.7;
                          ">
                            Your account has been
                            successfully created and
                            your Gmail address has been
                            verified.
                          </p>

                          <p style="
                            color: #555;
                            line-height: 1.7;
                          ">
                            You can now log in to TestHub,
                            start taking tests, track your
                            progress and earn certificates.
                          </p>

                          <div style="
                            margin: 25px 0;
                            padding: 18px;
                            background: #f1efff;
                            border-radius: 12px;
                            text-align: center;
                          ">
                            <strong style="
                              color: #4f46e5;
                              font-size: 18px;
                            ">
                              Welcome aboard! 🚀
                            </strong>
                          </div>

                          <h3 style="
                            color: #333;
                          ">
                            Need Help? 💬
                          </h3>

                          <p style="
                            color: #666;
                            line-height: 1.8;
                          ">
                            If you face any problem,
                            please contact our support team.
                          </p>

                          <p style="
                          color: #666;
                          line-height: 1.8;
                        ">
                          📞 Contact Support: +91 6396200316<br>
                          📧 Help & Queries: ${process.env.EMAIL_USER}
                         </p>

                          <hr style="
                            border: none;
                            border-top: 1px solid #eee;
                            margin: 25px 0;
                          ">

                          <p style="
                            color: #777;
                            text-align: center;
                            font-size: 13px;
                          ">
                            We're happy to have you with us! 😊
                          </p>

                          <p style="
                            color: #555;
                            text-align: center;
                            font-weight: bold;
                          ">
                            Team TestHub
                          </p>

                        </div>

                      </div>
                    `,
                  });

                } catch (emailError) {
                  /*
                    ACCOUNT IS ALREADY CREATED.
                    EMAIL FAILURE SHOULD NOT
                    DELETE THE ACCOUNT.
                  */

                  console.log(
                    "WELCOME EMAIL ERROR:",
                    emailError
                  );
                }

                /* DELETE USED OTP */

                db.query(
                  "DELETE FROM registration_otps WHERE email = ?",
                  [cleanEmail],
                  () => {
                    /* FINAL RESPONSE */

                    res.status(201).json({
                      message:
                        "Registration successful!",
                      userId:
                        result.insertId,
                    });
                  }
                );
              }
            );
          }
        );
      }
    );

  } catch (error) {
    console.log(
      "REGISTRATION ERROR:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
});

/* ================= GET ALL TESTS ================= */

app.get("/api/tests", (req, res) => {
  const sql = `
    SELECT
      tests.id,
      tests.title,
      tests.duration,
      tests.total_questions,
      tests.description,
      categories.name AS category
    FROM tests
    JOIN categories
      ON tests.category_id = categories.id
    ORDER BY tests.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Failed to fetch tests",
      });
    }

    res.json({
      tests: results,
    });
  });
});

/* ================= GET TEST QUESTIONS ================= */

app.get("/api/tests/:id", (req, res) => {
  const testId = req.params.id;

  const testSql = `
    SELECT
      tests.id,
      tests.title,
      tests.duration,
      tests.total_questions,
      tests.description,
      categories.name AS category
    FROM tests
    JOIN categories
      ON tests.category_id = categories.id
    WHERE tests.id = ?
  `;

  const questionSql = `
    SELECT
      id,
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      difficulty
    FROM questions
    WHERE test_id = ?
    ORDER BY id
  `;

  db.query(
    testSql,
    [testId],
    (err, testResults) => {
      if (err) {
        console.log(err);

        return res.status(500).json({
          message: "Failed to fetch test",
        });
      }

      if (testResults.length === 0) {
        return res.status(404).json({
          message: "Test not found",
        });
      }

      db.query(
        questionSql,
        [testId],
        (err, questionResults) => {
          if (err) {
            console.log(err);

            return res.status(500).json({
              message:
                "Failed to fetch questions",
            });
          }

          res.json({
            test: testResults[0],
            questions: questionResults,
          });
        }
      );
    }
  );
});

/* ================= SUBMIT TEST ================= */

app.post(
  "/api/tests/:id/submit",
  (req, res) => {
    const testId = req.params.id;

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Please login first",
      });
    }

    const token =
      authHeader.split(" ")[1];

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return res.status(401).json({
        message:
          "Invalid or expired token",
      });
    }

    const userId = decoded.id;

    const {
      answers = {},
      timeTaken = 0,
    } = req.body;

    console.log(
      "========== TEST SUBMISSION =========="
    );

    console.log("Test ID:", testId);
    console.log("User ID:", userId);
    console.log(
      "Answers received:",
      answers
    );
    console.log(
      "Time taken:",
      timeTaken
    );

    console.log(
      "====================================="
    );

    const sql = `
      SELECT
        id,
        correct_answer
      FROM questions
      WHERE test_id = ?
      ORDER BY id
    `;

    db.query(
      sql,
      [testId],
      (err, questions) => {
        if (err) {
          console.log(
            "GET QUESTIONS ERROR:",
            err
          );

          return res.status(500).json({
            message:
              "Failed to check answers",
            error: err.message,
          });
        }

        let score = 0;

        questions.forEach(
          (question) => {
            const selected =
              answers[question.id];

            console.log(
              `Question ${question.id}: Selected=${selected}, Correct=${question.correct_answer}`
            );

            if (
              selected &&
              selected ===
                question.correct_answer
            ) {
              score++;
            }
          }
        );

        const totalQuestions =
          questions.length;

        const percentage =
          totalQuestions > 0
            ? (
                (score /
                  totalQuestions) *
                100
              ).toFixed(2)
            : 0;

        console.log(
          "FINAL SCORE:",
          score
        );

        console.log(
          "TOTAL QUESTIONS:",
          totalQuestions
        );

        console.log(
          "PERCENTAGE:",
          percentage
        );

        /* ================= SAVE RESULT ================= */

        const resultSql = `
          INSERT INTO results
          (
            user_id,
            test_id,
            score,
            total_questions,
            percentage,
            time_taken
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
          resultSql,
          [
            userId,
            testId,
            score,
            totalQuestions,
            percentage,
            Number(timeTaken) || 0,
          ],
          (err, result) => {
            if (err) {
              console.log(
                "SAVE RESULT ERROR:",
                err
              );

              return res.status(500).json({
                message:
                  "Failed to save result",
                error: err.message,
              });
            }

            const resultId =
              result.insertId;

            /* ================= CREATE CERTIFICATE REQUEST ================= */

            if (
              Number(percentage) >= 60
            ) {
              const certificateId =
                `OT-${new Date().getFullYear()}-${String(
                  resultId
                ).padStart(6, "0")}`;

              let grade = "C";

              if (
                Number(percentage) >= 90
              ) {
                grade = "A+";
              } else if (
                Number(percentage) >= 80
              ) {
                grade = "A";
              } else if (
                Number(percentage) >= 70
              ) {
                grade = "B+";
              } else if (
                Number(percentage) >= 60
              ) {
                grade = "B";
              }

              const certificateSql = `
                INSERT INTO certificates
                (
                  certificate_id,
                  user_id,
                  test_id,
                  result_id,
                  student_name,
                  test_title,
                  score,
                  grade,
                  status,
                  requested_at,
                  auto_approved
                )
                SELECT
                  ?,
                  u.id,
                  t.id,
                  ?,
                  u.name,
                  t.title,
                  ?,
                  ?,
                  'Pending',
                  NOW(),
                  0
                FROM users u
                CROSS JOIN tests t
                WHERE u.id = ?
                  AND t.id = ?
              `;

              db.query(
                certificateSql,
                [
                  certificateId,
                  resultId,
                  Number(percentage),
                  grade,
                  userId,
                  testId,
                ],
                (certificateErr) => {
                  if (certificateErr) {
                    console.log(
                      "CREATE CERTIFICATE ERROR:",
                      certificateErr
                    );
                  } else {
                    console.log(
                      "🎓 Certificate request created:",
                      certificateId
                    );
                  }
                }
              );
            }

            /* ================= SAVE ANSWERS ================= */

            const answerEntries =
              questions
                .filter(
                  (question) => {
                    const selected =
                      answers[
                        question.id
                      ];

                    return (
                      selected !==
                        undefined &&
                      selected !== null &&
                      selected !== ""
                    );
                  }
                )
                .map(
                  (question) => [
                    resultId,
                    question.id,
                    answers[
                      question.id
                    ],
                  ]
                );

            console.log(
              "ANSWER ENTRIES:",
              answerEntries
            );

            /* No answers selected */

            if (
              answerEntries.length ===
              0
            ) {
              return res.json({
                message:
                  "Test submitted successfully",
                resultId,
                score,
                totalQuestions,
                percentage,
              });
            }

            const answerSql = `
              INSERT INTO answers
              (
                result_id,
                question_id,
                selected_answer
              )
              VALUES ?
            `;

            db.query(
              answerSql,
              [answerEntries],
              (err) => {
                if (err) {
                  console.log(
                    "SAVE ANSWERS ERROR:",
                    err
                  );

                  return res.status(500).json({
                    message:
                      "Result saved, but answers could not be saved",
                    error: err.message,
                  });
                }

                console.log(
                  "ANSWERS SAVED SUCCESSFULLY"
                );

                res.json({
                  message:
                    "Test submitted successfully",
                  resultId,
                  score,
                  totalQuestions,
                  percentage,
                });
              }
            );
          }
        );
      }
    );
  }
);

/* ================= GET RESULT ================= */

app.get(
  "/api/results/:id",
  (req, res) => {
    const resultId = req.params.id;

    const sql = `
      SELECT
        r.id,
        r.test_id,
        r.user_id,
        r.score,
        r.total_questions,
        r.percentage,
        r.time_taken,
        r.submitted_at,
        t.title AS test_title,
        t.duration,
        u.name AS user_name
      FROM results r
      JOIN tests t
        ON r.test_id = t.id
      JOIN users u
        ON r.user_id = u.id
      WHERE r.id = ?
    `;

    db.query(
      sql,
      [resultId],
      (err, results) => {
        if (err) {
          console.log(
            "RESULT ERROR:",
            err
          );

          return res.status(500).json({
            message:
              "Failed to fetch result",
            error: err.message,
          });
        }

        if (
          results.length === 0
        ) {
          return res.status(404).json({
            message:
              "Result not found",
          });
        }

        const resultData =
          results[0];

        const answersSql = `
          SELECT
            q.id,
            q.question,
            q.option_a,
            q.option_b,
            q.option_c,
            q.option_d,
            q.correct_answer,
            a.selected_answer
          FROM questions q
          LEFT JOIN answers a
            ON q.id = a.question_id
            AND a.result_id = ?
          WHERE q.test_id = ?
          ORDER BY q.id
        `;

        db.query(
          answersSql,
          [
            resultId,
            resultData.test_id,
          ],
          (answerErr, answers) => {
            if (answerErr) {
              console.log(
                "ANSWERS ERROR:",
                answerErr
              );

              return res.status(500).json({
                message:
                  "Failed to fetch answers",
                error:
                  answerErr.message,
              });
            }

            res.json({
              result: resultData,
              answers,
            });
          }
        );
      }
    );
  }
);

/* ================= DASHBOARD STATS ================= */

app.get(
  "/api/dashboard/stats",
  (req, res) => {
    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message:
          "No token provided",
      });
    }

    const token =
      authHeader.split(" ")[1];

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return res.status(401).json({
        message:
          "Invalid or expired token",
      });
    }

    const userId = decoded.id;

    const sql = `
      SELECT
        COUNT(*) AS testsTaken,
        COUNT(*) AS completed,
        COALESCE(
          ROUND(
            AVG(percentage),
            2
          ),
          0
        ) AS averageScore,
        COALESCE(
          MAX(percentage),
          0
        ) AS bestScore
      FROM results
      WHERE user_id = ?
    `;

    db.query(
      sql,
      [userId],
      (err, results) => {
        if (err) {
          console.log(
            "DASHBOARD STATS ERROR:",
            err
          );

          return res.status(500).json({
            message:
              "Failed to fetch dashboard stats",
            error: err.message,
          });
        }

        res.json({
          stats: results[0],
        });
      }
    );
  }
);

/* ================= LEADERBOARD ================= */

app.get(
  "/api/leaderboard",
  (req, res) => {
    const sql = `
      SELECT
        u.id,
        u.name,
        COUNT(r.id) AS tests,
        COALESCE(
          MAX(r.percentage),
          0
        ) AS bestScore
      FROM users u
      INNER JOIN results r
        ON u.id = r.user_id
      GROUP BY
        u.id,
        u.name
      ORDER BY
        bestScore DESC,
        tests DESC
      LIMIT 5
    `;

    db.query(
      sql,
      (err, results) => {
        if (err) {
          console.log(
            "LEADERBOARD ERROR:",
            err
          );

          return res.status(500).json({
            message:
              "Failed to fetch leaderboard",
            error: err.message,
          });
        }

        res.json({
          leaderboard: results,
        });
      }
    );
  }
);

/* ================= STUDENT DASHBOARD RESULTS ================= */

app.get(
  "/api/dashboard/results",
  (req, res) => {
    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message:
          "No token provided",
      });
    }

    const token =
      authHeader.split(" ")[1];

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return res.status(401).json({
        message:
          "Invalid or expired token",
      });
    }

    const userId = decoded.id;

    const sql = `
      SELECT
        r.id,
        r.user_id,
        r.test_id,
        r.score,
        r.total_questions,
        ROUND(
          r.percentage,
          2
        ) AS percentage,
        r.time_taken,
        r.submitted_at,
        t.title AS test_title
      FROM results r
      INNER JOIN tests t
        ON r.test_id = t.id
      WHERE r.user_id = ?
      ORDER BY r.id DESC
    `;

    db.query(
      sql,
      [userId],
      (err, results) => {
        if (err) {
          console.log(
            "STUDENT DASHBOARD RESULTS ERROR:",
            err
          );

          return res.status(500).json({
            message:
              "Failed to fetch dashboard results",
            error: err.message,
          });
        }

        res.json({
          results,
        });
      }
    );
  }
);

/* ================= ADMIN STATS ================= */

app.get(
  "/api/admin/stats",
  (req, res) => {
    const sql = `
      SELECT
        (SELECT COUNT(*)
         FROM users) AS totalUsers,

        (SELECT COUNT(*)
         FROM tests) AS totalTests,

        (SELECT COUNT(*)
         FROM results) AS totalAttempts,

        (
          SELECT COALESCE(
            ROUND(
              AVG(percentage),
              2
            ),
            0
          )
          FROM results
        ) AS averageScore
    `;

    db.query(
      sql,
      (err, results) => {
        if (err) {
          console.log(
            "ADMIN STATS ERROR:",
            err
          );

          return res.status(500).json({
            message:
              "Failed to fetch admin stats",
            error: err.message,
          });
        }

        res.json({
          stats: results[0],
        });
      }
    );
  }
);

/* ================= ADMIN USERS ================= */

app.get(
  "/api/admin/users",
  (req, res) => {
    const sql = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at,
        COUNT(r.id) AS tests_attempted
      FROM users u
      LEFT JOIN results r
        ON u.id = r.user_id
      GROUP BY
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at
      ORDER BY u.id DESC
    `;

    db.query(
      sql,
      (err, results) => {
        if (err) {
          console.log(
            "ADMIN USERS ERROR:",
            err
          );

          return res.status(500).json({
            message:
              "Failed to fetch users",
            error: err.message,
          });
        }

        res.json({
          users: results,
        });
      }
    );
  }
);

/* ================= ADMIN CREATE USER ================= */

app.post(
  "/api/admin/users",
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        role,
      } = req.body;

      if (
        !name ||
        !email ||
        !password ||
        !role
      ) {
        return res.status(400).json({
          message:
            "Name, email, password and role are required",
        });
      }

      if (
        !["student", "admin"].includes(
          role
        )
      ) {
        return res.status(400).json({
          message: "Invalid role",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          message:
            "Password must be at least 6 characters",
        });
      }

      const checkSql =
        "SELECT id FROM users WHERE email = ?";

      db.query(
        checkSql,
        [email.trim()],
        async (err, results) => {
          if (err) {
            console.log(
              "CHECK USER ERROR:",
              err
            );

            return res.status(500).json({
              message:
                "Database error",
            });
          }

          if (results.length > 0) {
            return res.status(409).json({
              message:
                "Email already registered",
            });
          }

          const hashedPassword =
            await bcrypt.hash(
              password,
              10
            );

          const insertSql = `
            INSERT INTO users
            (
              name,
              email,
              password,
              role
            )
            VALUES (?, ?, ?, ?)
          `;

          db.query(
            insertSql,
            [
              name.trim(),
              email.trim(),
              hashedPassword,
              role,
            ],
            (err, result) => {
              if (err) {
                console.log(
                  "CREATE USER ERROR:",
                  err
                );

                return res.status(500).json({
                  message:
                    "Failed to create user",
                  error:
                    err.message,
                });
              }

              res.status(201).json({
                message:
                  "User created successfully",
                userId:
                  result.insertId,
              });
            }
          );
        }
      );
    } catch (error) {
      console.log(
        "CREATE USER SERVER ERROR:",
        error
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

/* ================= ADMIN UPDATE USER ================= */

app.put(
  "/api/admin/users/:id",
  async (req, res) => {
    try {
      const userId = req.params.id;

      const {
        name,
        email,
        password,
        role,
      } = req.body;

      if (!name || !email || !role) {
        return res.status(400).json({
          message:
            "Name, email and role are required",
        });
      }

      if (
        !["student", "admin"].includes(role)
      ) {
        return res.status(400).json({
          message: "Invalid role",
        });
      }

      if (
        password &&
        password.length < 6
      ) {
        return res.status(400).json({
          message:
            "Password must be at least 6 characters",
        });
      }

      const checkSql = `
        SELECT id
        FROM users
        WHERE email = ?
        AND id != ?
      `;

      db.query(
        checkSql,
        [email.trim(), userId],
        async (err, results) => {
          if (err) {
            console.log(
              "CHECK UPDATE USER ERROR:",
              err
            );

            return res.status(500).json({
              message: "Database error",
            });
          }

          if (results.length > 0) {
            return res.status(409).json({
              message:
                "Email already registered by another user",
            });
          }

          /* UPDATE WITH PASSWORD */

          if (password) {
            const hashedPassword =
              await bcrypt.hash(
                password,
                10
              );

            const updateSql = `
              UPDATE users
              SET
                name = ?,
                email = ?,
                password = ?,
                role = ?
              WHERE id = ?
            `;

            db.query(
              updateSql,
              [
                name.trim(),
                email.trim(),
                hashedPassword,
                role,
                userId,
              ],
              (err, result) => {
                if (err) {
                  console.log(
                    "UPDATE USER ERROR:",
                    err
                  );

                  return res.status(500).json({
                    message:
                      "Failed to update user",
                    error:
                      err.message,
                  });
                }

                if (
                  result.affectedRows === 0
                ) {
                  return res.status(404).json({
                    message:
                      "User not found",
                  });
                }

                res.json({
                  message:
                    "User updated successfully",
                });
              }
            );

            return;
          }

          /* UPDATE WITHOUT PASSWORD */

          const updateSql = `
            UPDATE users
            SET
              name = ?,
              email = ?,
              role = ?
            WHERE id = ?
          `;

          db.query(
            updateSql,
            [
              name.trim(),
              email.trim(),
              role,
              userId,
            ],
            (err, result) => {
              if (err) {
                console.log(
                  "UPDATE USER ERROR:",
                  err
                );

                return res.status(500).json({
                  message:
                    "Failed to update user",
                  error:
                    err.message,
                });
              }

              if (
                result.affectedRows === 0
              ) {
                return res.status(404).json({
                  message:
                    "User not found",
                });
              }

              res.json({
                message:
                  "User updated successfully",
              });
            }
          );
        }
      );
    } catch (error) {
      console.log(
        "UPDATE USER SERVER ERROR:",
        error
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

/* ================= ADMIN DELETE USER ================= */

app.delete(
  "/api/admin/users/:id",
  (req, res) => {
    const userId = req.params.id;

    const deleteSql =
      "DELETE FROM users WHERE id = ?";

    db.query(
      deleteSql,
      [userId],
      (err, result) => {
        if (err) {
          console.log(
            "DELETE USER ERROR:",
            err
          );

          return res.status(500).json({
            message:
              "Failed to delete user",
            error: err.message,
          });
        }

        if (
          result.affectedRows === 0
        ) {
          return res.status(404).json({
            message:
              "User not found",
          });
        }

        res.json({
          message:
            "User deleted successfully",
        });
      }
    );
  }
);

/* ================= ADMIN RECENT RESULTS ================= */

app.get(
  "/api/admin/recent-results",
  (req, res) => {
    const sql = `
      SELECT
        r.id,
        r.score,
        r.total_questions,
        r.percentage,
        r.time_taken,
        r.submitted_at,
        u.name AS user_name,
        u.email AS user_email,
        t.title AS test_title
      FROM results r
      INNER JOIN users u
        ON r.user_id = u.id
      INNER JOIN tests t
        ON r.test_id = t.id
      ORDER BY r.id DESC
      LIMIT 10
    `;

    db.query(
      sql,
      (err, results) => {
        if (err) {
          console.log(
            "RECENT RESULTS ERROR:",
            err
          );

          return res.status(500).json({
            message:
              "Failed to fetch recent results",
            error: err.message,
          });
        }

        res.json({
          results,
        });
      }
    );
  }
);

/* ================= ADMIN TESTS ================= */

/* GET ALL ADMIN TESTS */

app.get(
  "/api/admin/tests",
  (req, res) => {
    const sql = `
      SELECT
        tests.id,
        tests.title,
        tests.duration,
        tests.total_questions,
        tests.description,
        categories.name AS category,
        COUNT(questions.id) AS question_count
      FROM tests
      LEFT JOIN categories
        ON tests.category_id = categories.id
      LEFT JOIN questions
        ON tests.id = questions.test_id
      GROUP BY
        tests.id,
        tests.title,
        tests.duration,
        tests.total_questions,
        tests.description,
        categories.name
      ORDER BY tests.id DESC
    `;

    db.query(
      sql,
      (err, results) => {
        if (err) {
          console.log(
            "ADMIN TESTS ERROR:",
            err
          );

          return res.status(500).json({
            message:
              "Failed to fetch tests",
            error: err.message,
          });
        }

        res.json({
          tests: results,
        });
      }
    );
  }
);

/* ================= DELETE TEST ================= */

app.delete(
  "/api/admin/tests/:id",
  (req, res) => {
    const testId = req.params.id;

    const deleteAnswersSql = `
      DELETE answers
      FROM answers
      INNER JOIN questions
        ON answers.question_id = questions.id
      WHERE questions.test_id = ?
    `;

    const deleteResultsSql = `
      DELETE FROM results
      WHERE test_id = ?
    `;

    const deleteQuestionsSql = `
      DELETE FROM questions
      WHERE test_id = ?
    `;

    const deleteTestSql = `
      DELETE FROM tests
      WHERE id = ?
    `;

    db.query(
      deleteAnswersSql,
      [testId],
      (err) => {
        if (err) {
          console.log(
            "DELETE ANSWERS ERROR:",
            err
          );

          return res.status(500).json({
            message:
              "Failed to delete test answers",
            error: err.message,
          });
        }

        db.query(
          deleteResultsSql,
          [testId],
          (err) => {
            if (err) {
              console.log(
                "DELETE RESULTS ERROR:",
                err
              );

              return res.status(500).json({
                message:
                  "Failed to delete test results",
                error: err.message,
              });
            }

            db.query(
              deleteQuestionsSql,
              [testId],
              (err) => {
                if (err) {
                  console.log(
                    "DELETE QUESTIONS ERROR:",
                    err
                  );

                  return res.status(500).json({
                    message:
                      "Failed to delete test questions",
                    error: err.message,
                  });
                }

                db.query(
                  deleteTestSql,
                  [testId],
                  (err, result) => {
                    if (err) {
                      console.log(
                        "DELETE TEST ERROR:",
                        err
                      );

                      return res.status(500).json({
                        message:
                          "Failed to delete test",
                        error:
                          err.message,
                      });
                    }

                    if (
                      result.affectedRows ===
                      0
                    ) {
                      return res.status(404).json({
                        message:
                          "Test not found",
                      });
                    }

                    res.json({
                      message:
                        "Test deleted successfully",
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  }
);

/* ================= CREATE ADMIN TEST ================= */

app.post(
  "/api/admin/tests",
  (req, res) => {
    const {
      title,
      category_id,
      duration,
      description,
    } = req.body;

    if (
      !title ||
      !category_id ||
      !duration
    ) {
      return res.status(400).json({
        message:
          "Title, category and duration are required",
      });
    }

    const sql = `
      INSERT INTO tests
      (
        title,
        category_id,
        duration,
        total_questions,
        description
      )
      VALUES (?, ?, ?, 0, ?)
    `;

    db.query(
      sql,
      [
        title.trim(),
        Number(category_id),
        Number(duration),
        description
          ? description.trim()
          : "",
      ],
      (err, result) => {
        if (err) {
          console.log(
            "CREATE TEST ERROR:",
            err
          );

          return res.status(500).json({
            message:
              "Failed to create test",
            error: err.message,
          });
        }

        res.status(201).json({
          message:
            "Test created successfully",
          testId: result.insertId,
          questionCount: 0,
        });
      }
    );
  }
);

/* ================= GET CATEGORIES ================= */

app.get(
  "/api/categories",
  (req, res) => {
    const sql = `
      SELECT id, name
      FROM categories
      ORDER BY name ASC
    `;

    db.query(
      sql,
      (err, results) => {
        if (err) {
          console.log(
            "CATEGORIES ERROR:",
            err
          );

          return res.status(500).json({
            message:
              "Failed to fetch categories",
            error: err.message,
          });
        }

        res.json({
          categories: results,
        });
      }
    );
  }
);

/* ================= ADMIN QUESTIONS ================= */

/* GET QUESTIONS BY TEST */

app.get(
  "/api/admin/tests/:testId/questions",
  (req, res) => {
    const testId =
      req.params.testId;

    const sql = `
      SELECT
        id,
        test_id,
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        difficulty
      FROM questions
      WHERE test_id = ?
      ORDER BY id ASC
    `;

    db.query(
      sql,
      [testId],
      (err, results) => {
        if (err) {
          console.log(err);

          return res.status(500).json({
            message:
              "Failed to fetch questions",
            error: err.message,
          });
        }

        res.json({
          questions: results,
        });
      }
    );
  }
);

/* ================= ADD QUESTION ================= */

app.post(
  "/api/admin/tests/:testId/questions",
  (req, res) => {
    const testId =
      req.params.testId;

    const {
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      difficulty = "Medium",
    } = req.body;

    if (
      !question ||
      !option_a ||
      !option_b ||
      !option_c ||
      !option_d ||
      !correct_answer
    ) {
      return res.status(400).json({
        message:
          "All question fields are required",
      });
    }

    if (
      !["A", "B", "C", "D"].includes(
        correct_answer
      )
    ) {
      return res.status(400).json({
        message:
          "Correct answer must be A, B, C or D",
      });
    }

    if (
      ![
        "Easy",
        "Medium",
        "Hard",
      ].includes(difficulty)
    ) {
      return res.status(400).json({
        message:
          "Difficulty must be Easy, Medium or Hard",
      });
    }

    const insertSql = `
      INSERT INTO questions
      (
        test_id,
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        difficulty
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertSql,
      [
        testId,
        question.trim(),
        option_a.trim(),
        option_b.trim(),
        option_c.trim(),
        option_d.trim(),
        correct_answer,
        difficulty,
      ],
      (err, result) => {
        if (err) {
          console.log(
            "ADD QUESTION ERROR:",
            err
          );

          return res.status(500).json({
            message:
              "Failed to add question",
            error: err.message,
          });
        }

        const countSql = `
          SELECT COUNT(*) AS question_count
          FROM questions
          WHERE test_id = ?
        `;

        db.query(
          countSql,
          [testId],
          (countErr, countResult) => {
            if (countErr) {
              console.log(
                "COUNT QUESTIONS ERROR:",
                countErr
              );

              return res.status(500).json({
                message:
                  "Question added but count failed",
                error:
                  countErr.message,
              });
            }

            const questionCount =
              countResult[0]
                .question_count;

            const updateSql = `
              UPDATE tests
              SET total_questions = ?
              WHERE id = ?
            `;

            db.query(
              updateSql,
              [
                questionCount,
                testId,
              ],
              (updateErr) => {
                if (updateErr) {
                  console.log(
                    "UPDATE QUESTION COUNT ERROR:",
                    updateErr
                  );

                  return res.status(500).json({
                    message:
                      "Question added but test count update failed",
                    error:
                      updateErr.message,
                  });
                }

                res.status(201).json({
                  message:
                    "Question added successfully",
                  questionId:
                    result.insertId,
                  questionCount,
                });
              }
            );
          }
        );
      }
    );
  }
);

/* ================= DELETE QUESTION ================= */

app.delete(
  "/api/admin/questions/:id",
  (req, res) => {
    const questionId =
      req.params.id;

    const findSql = `
      SELECT test_id
      FROM questions
      WHERE id = ?
    `;

    db.query(
      findSql,
      [questionId],
      (findErr, findResult) => {
        if (findErr) {
          console.log(
            "FIND QUESTION ERROR:",
            findErr
          );

          return res.status(500).json({
            message:
              "Failed to find question",
            error:
              findErr.message,
          });
        }

        if (
          findResult.length === 0
        ) {
          return res.status(404).json({
            message:
              "Question not found",
          });
        }

        const testId =
          findResult[0].test_id;

        const deleteAnswersSql = `
          DELETE FROM answers
          WHERE question_id = ?
        `;

        db.query(
          deleteAnswersSql,
          [questionId],
          (answerErr) => {
            if (answerErr) {
              console.log(
                "DELETE ANSWERS ERROR:",
                answerErr
              );

              return res.status(500).json({
                message:
                  "Failed to delete question answers",
                error:
                  answerErr.message,
              });
            }

            const deleteQuestionSql = `
              DELETE FROM questions
              WHERE id = ?
            `;

            db.query(
              deleteQuestionSql,
              [questionId],
              (
                deleteErr,
                deleteResult
              ) => {
                if (deleteErr) {
                  console.log(
                    "DELETE QUESTION ERROR:",
                    deleteErr
                  );

                  return res.status(500).json({
                    message:
                      "Failed to delete question",
                    error:
                      deleteErr.message,
                  });
                }

                if (
                  deleteResult.affectedRows ===
                  0
                ) {
                  return res.status(404).json({
                    message:
                      "Question not found",
                  });
                }

                const countSql = `
                  SELECT COUNT(*) AS question_count
                  FROM questions
                  WHERE test_id = ?
                `;

                db.query(
                  countSql,
                  [testId],
                  (
                    countErr,
                    countResult
                  ) => {
                    if (countErr) {
                      console.log(
                        "COUNT ERROR:",
                        countErr
                      );

                      return res.status(500).json({
                        message:
                          "Question deleted but count failed",
                        error:
                          countErr.message,
                      });
                    }

                    const questionCount =
                      countResult[0]
                        .question_count;

                    const updateSql = `
                      UPDATE tests
                      SET total_questions = ?
                      WHERE id = ?
                    `;

                    db.query(
                      updateSql,
                      [
                        questionCount,
                        testId,
                      ],
                      (updateErr) => {
                        if (updateErr) {
                          console.log(
                            "UPDATE COUNT ERROR:",
                            updateErr
                          );

                          return res.status(500).json({
                            message:
                              "Question deleted but count update failed",
                            error:
                              updateErr.message,
                          });
                        }

                        res.json({
                          message:
                            "Question deleted successfully",
                          questionCount,
                        });
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  }
);

/* ================= UPDATE ADMIN TEST ================= */

app.put(
  "/api/admin/tests/:id",
  (req, res) => {
    const testId =
      req.params.id;

    const {
      title,
      category_id,
      duration,
      description,
    } = req.body;

    if (
      !title ||
      !category_id ||
      !duration
    ) {
      return res.status(400).json({
        message:
          "Title, category and duration are required",
      });
    }

    const countSql = `
      SELECT COUNT(*) AS question_count
      FROM questions
      WHERE test_id = ?
    `;

    db.query(
      countSql,
      [testId],
      (countErr, countResult) => {
        if (countErr) {
          console.log(
            "COUNT QUESTIONS ERROR:",
            countErr
          );

          return res.status(500).json({
            message:
              "Failed to count questions",
            error:
              countErr.message,
          });
        }

        const questionCount =
          Number(
            countResult[0]
              .question_count
          );

        const updateSql = `
          UPDATE tests
          SET
            title = ?,
            category_id = ?,
            duration = ?,
            total_questions = ?,
            description = ?
          WHERE id = ?
        `;

        db.query(
          updateSql,
          [
            title.trim(),
            Number(category_id),
            Number(duration),
            questionCount,
            description || "",
            testId,
          ],
          (err, result) => {
            if (err) {
              console.log(
                "UPDATE TEST ERROR:",
                err
              );

              return res.status(500).json({
                message:
                  "Failed to update test",
                error: err.message,
              });
            }

            if (
              result.affectedRows ===
              0
            ) {
              return res.status(404).json({
                message:
                  "Test not found",
              });
            }

            res.json({
              message:
                "Test updated successfully",
              questionCount,
            });
          }
        );
      }
    );
  }
);

/* ================= FORGOT PASSWORD ================= */

app.post("/api/forgot-password", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required",
    });
  }

  const sql = `
    SELECT id, name, email
    FROM users
    WHERE email = ?
  `;

  db.query(sql, [email.trim()], (err, results) => {
    if (err) {
      console.log("FORGOT PASSWORD DB ERROR:", err);

      return res.status(500).json({
        message: "Database error",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    const user = results[0];

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    const deleteOldSql = `
      DELETE FROM password_resets
      WHERE email = ?
    `;

    db.query(
      deleteOldSql,
      [user.email],
      (deleteErr) => {
        if (deleteErr) {
          console.log("DELETE OLD OTP ERROR:", deleteErr);

          return res.status(500).json({
            message: "Failed to create OTP",
          });
        }

        const insertSql = `
          INSERT INTO password_resets
          (user_id, email, otp, expires_at)
          VALUES (?, ?, ?, ?)
        `;

        db.query(
          insertSql,
          [
            user.id,
            user.email,
            otp,
            expiresAt,
          ],
          async (insertErr) => {
            if (insertErr) {
              console.log("INSERT OTP ERROR:", insertErr);

              return res.status(500).json({
                message: "Failed to save OTP",
              });
            }

            try {
              await transporter.sendMail({
                from: `"TestHub" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: "TestHub Password Reset OTP",

                html: `
                  <div style="
                    font-family: Arial;
                    max-width: 600px;
                    margin: auto;
                    padding: 30px;
                    border: 1px solid #ddd;
                    border-radius: 15px;
                  ">

                    <h2 style="color:#1678eb;">
                      🎓 TestHub
                    </h2>

                    <h3>Password Reset Request</h3>

                    <p>
                      Hello ${user.name},
                    </p>

                    <p>
                      Use the OTP below to reset your
                      TestHub password.
                    </p>

                    <div style="
                      font-size:32px;
                      font-weight:bold;
                      letter-spacing:8px;
                      color:#1678eb;
                      background:#f1f6ff;
                      padding:20px;
                      text-align:center;
                      border-radius:10px;
                    ">
                      ${otp}
                    </div>

                    <p>
                      This OTP is valid for
                      <strong>10 minutes</strong>.
                    </p>

                    <p>
                      If you did not request a password
                      reset, please ignore this email.
                    </p>

                    <hr />

                    <small>
                      © 2026 TestHub
                    </small>

                  </div>
                `,
              });

              console.log(
                "OTP EMAIL SENT:",
                user.email
              );

              res.json({
                message:
                  "OTP sent successfully to your email",
              });

            } catch (mailError) {
              console.log(
                "SEND OTP EMAIL ERROR:",
                mailError
              );

              return res.status(500).json({
                message:
                  "Failed to send OTP email",
              });
            }
          }
        );
      }
    );
  });
});


/* ================= VERIFY OTP ================= */

app.post("/api/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      message: "Email and OTP are required",
    });
  }

  const sql = `
    SELECT *
    FROM password_resets
    WHERE email = ?
      AND otp = ?
      AND expires_at > NOW()
      AND verified = FALSE
    ORDER BY id DESC
    LIMIT 1
  `;

  db.query(
    sql,
    [email.trim(), otp.trim()],
    (err, results) => {

      if (err) {
        console.log("VERIFY OTP DB ERROR:", err);

        return res.status(500).json({
          message: "Database error",
        });
      }

      if (results.length === 0) {
        return res.status(400).json({
          message: "Invalid or expired OTP",
        });
      }

      const reset = results[0];

      const updateSql = `
        UPDATE password_resets
        SET verified = TRUE
        WHERE id = ?
      `;

      db.query(
        updateSql,
        [reset.id],
        (updateErr) => {

          if (updateErr) {
            console.log(
              "VERIFY OTP UPDATE ERROR:",
              updateErr
            );

            return res.status(500).json({
              message:
                "Failed to verify OTP",
            });
          }

          res.json({
            message:
              "OTP verified successfully",
          });
        }
      );
    }
  );
});


/* ================= RESET PASSWORD ================= */

app.post("/api/reset-password", async (req, res) => {
  const {
    email,
    password,
    confirmPassword,
  } = req.body;

  if (
    !email ||
    !password ||
    !confirmPassword
  ) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      message: "Passwords do not match",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message:
        "Password must be at least 6 characters",
    });
  }

  const checkSql = `
    SELECT id
    FROM password_resets
    WHERE email = ?
      AND verified = TRUE
      AND created_at >= DATE_SUB(
        NOW(),
        INTERVAL 15 MINUTE
      )
    ORDER BY id DESC
    LIMIT 1
  `;

  db.query(
    checkSql,
    [email.trim()],
    async (err, results) => {

      if (err) {
        console.log(
          "RESET PASSWORD DB ERROR:",
          err
        );

        return res.status(500).json({
          message: "Database error",
        });
      }

      if (results.length === 0) {
        return res.status(400).json({
          message:
            "Please verify OTP first",
        });
      }

      try {
        const hashedPassword =
          await bcrypt.hash(
            password,
            10
          );

        const updateSql = `
          UPDATE users
          SET password = ?
          WHERE email = ?
        `;

        db.query(
          updateSql,
          [
            hashedPassword,
            email.trim(),
          ],
          (updateErr, result) => {

            if (updateErr) {
              console.log(
                "UPDATE PASSWORD ERROR:",
                updateErr
              );

              return res.status(500).json({
                message:
                  "Failed to reset password",
              });
            }

            if (result.affectedRows === 0) {
              return res.status(404).json({
                message: "User not found",
              });
            }

            db.query(
              `
                DELETE FROM password_resets
                WHERE email = ?
              `,
              [email.trim()],
              (deleteErr) => {

                if (deleteErr) {
                  console.log(
                    "DELETE RESET OTP ERROR:",
                    deleteErr
                  );
                }

                res.json({
                  message:
                    "Password reset successfully 🎉",
                });
              }
            );
          }
        );

      } catch (error) {
        console.log(
          "RESET PASSWORD ERROR:",
          error
        );

        res.status(500).json({
          message: "Server error",
        });
      }
    }
  );
});

/* ================= LOGIN ================= */

app.post(
  "/api/login",
  (req, res) => {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    const sql =
      "SELECT * FROM users WHERE email = ?";

    db.query(
      sql,
      [email],
      async (err, results) => {
        if (err) {
          console.log(err);

          return res.status(500).json({
            message:
              "Database error",
          });
        }

        if (
          results.length === 0
        ) {
          return res.status(401).json({
            message:
              "Invalid email or password",
          });
        }

        const user =
          results[0];

        const passwordMatch =
          await bcrypt.compare(
            password,
            user.password
          );

        if (!passwordMatch) {
          return res.status(401).json({
            message:
              "Invalid email or password",
          });
        }

        const token =
          jwt.sign(
            {
              id: user.id,
              email: user.email,
              role: user.role,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: "1d",
            }
          );

        res.json({
          message:
            "Login successful",

          token,

          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      }
    );
  }
);

/* ================= PROFILE ================= */

/* GET PROFILE */

app.get(
  "/api/profile",
  authenticateToken,
  (req, res) => {
    const sql = `
      SELECT
        id,
        name,
        email,
        role,
        created_at,
        profile_photo
      FROM users
      WHERE id = ?
    `;

    db.query(
      sql,
      [req.user.id],
      (err, results) => {
        if (err) {
          console.log(
            "GET PROFILE ERROR:",
            err
          );

          return res.status(500).json({
            message: "Database error",
          });
        }

        if (results.length === 0) {
          return res.status(404).json({
            message: "User not found",
          });
        }

        res.json({
          user: results[0],
        });
      }
    );
  }
);


/* ================= UPDATE PROFILE ================= */

app.put(
  "/api/profile/update",
  authenticateToken,
  profileUpload.single("profilePhoto"),
  (req, res) => {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    // Pehle old photo nikaalo
    db.query(
      "SELECT profile_photo FROM users WHERE id = ?",
      [userId],
      (err, results) => {
        if (err) {
          console.log("GET OLD PHOTO ERROR:", err);
          return res.status(500).json({
            message: "Database error",
          });
        }

        if (results.length === 0) {
          return res.status(404).json({
            message: "User not found",
          });
        }

        const oldPhoto = results[0].profile_photo;

        let sql;
        let values;

        if (req.file) {
          const photoPath =
            `/uploads/profile/${req.file.filename}`;

          sql = `
            UPDATE users
            SET name = ?, profile_photo = ?
            WHERE id = ?
          `;

          values = [
            name.trim(),
            photoPath,
            userId,
          ];
        } else {
          sql = `
            UPDATE users
            SET name = ?
            WHERE id = ?
          `;

          values = [
            name.trim(),
            userId,
          ];
        }

        db.query(sql, values, (updateErr) => {
          if (updateErr) {
            console.log(
              "UPDATE PROFILE ERROR:",
              updateErr
            );

            return res.status(500).json({
              message: "Failed to update profile",
            });
          }

          // Old photo delete
          if (req.file && oldPhoto) {
            const oldFilePath = path.join(
              __dirname,
              oldPhoto.replace(/^\/uploads\//, "uploads/")
            );

            if (fs.existsSync(oldFilePath)) {
              fs.unlinkSync(oldFilePath);
            }
          }

          // Updated user return karo
          db.query(
            `
              SELECT
                id,
                name,
                email,
                role,
                created_at,
                profile_photo
              FROM users
              WHERE id = ?
            `,
            [userId],
            (selectErr, userResults) => {
              if (selectErr) {
                console.log(
                  "GET UPDATED PROFILE ERROR:",
                  selectErr
                );

                return res.status(500).json({
                  message: "Profile updated",
                });
              }

              res.json({
                message: "Profile updated successfully",
                user: userResults[0],
              });
            }
          );
        });
      }
    );
  }
);

/* ================= REMOVE PROFILE PHOTO ================= */

app.delete(
  "/api/profile/photo",
  authenticateToken,
  (req, res) => {
    const userId = req.user.id;

    db.query(
      "SELECT profile_photo FROM users WHERE id = ?",
      [userId],
      (err, results) => {
        if (err) {
          return res.status(500).json({
            message: "Database error",
          });
        }

        if (results.length === 0) {
          return res.status(404).json({
            message: "User not found",
          });
        }

        const oldPhoto = results[0].profile_photo;

        db.query(
          `
            UPDATE users
            SET profile_photo = NULL
            WHERE id = ?
          `,
          [userId],
          (updateErr) => {
            if (updateErr) {
              return res.status(500).json({
                message: "Failed to remove photo",
              });
            }

            if (oldPhoto) {
              const filePath = path.join(
                __dirname,
                oldPhoto.replace(/^\/uploads\//, "uploads/")
              );

              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            }

            res.json({
              message: "Profile photo removed",
            });
          }
        );
      }
    );
  }
);

/* ================= GET ALL ADMIN QUESTIONS ================= */

app.get(
  "/api/admin/questions",
  (req, res) => {
    const sql = `
      SELECT
        questions.id,
        questions.test_id,
        questions.question,
        questions.option_a,
        questions.option_b,
        questions.option_c,
        questions.option_d,
        questions.correct_answer,
        questions.difficulty,
        tests.title AS test_title,
        categories.name AS category
      FROM questions
      INNER JOIN tests
        ON questions.test_id = tests.id
      LEFT JOIN categories
        ON tests.category_id = categories.id
      ORDER BY questions.id DESC
    `;

    db.query(
      sql,
      (err, results) => {
        if (err) {
          console.log(
            "ALL QUESTIONS ERROR:",
            err
          );

          return res.status(500).json({
            message:
              "Failed to fetch all questions",
            error: err.message,
          });
        }

        res.json({
          questions: results,
        });
      }
    );
  }
);

/* ================= ADMIN ALL RESULTS ================= */

app.get(
  "/api/admin/results",
  (req, res) => {
    const sql = `
      SELECT
        r.id,
        r.user_id,
        r.test_id,
        r.score,
        r.total_questions,
        r.percentage,
        r.time_taken,
        r.submitted_at,
        u.name AS user_name,
        u.email AS user_email,
        t.title AS test_title
      FROM results r
      INNER JOIN users u
        ON r.user_id = u.id
      INNER JOIN tests t
        ON r.test_id = t.id
      ORDER BY r.id DESC
    `;

    db.query(
      sql,
      (err, results) => {
        if (err) {
          console.log(
            "ADMIN RESULTS ERROR:",
            err
          );

          return res.status(500).json({
            message:
              "Failed to fetch results",
            error: err.message,
          });
        }

        res.json({
          results,
        });
      }
    );
  }
);

/* ================= CERTIFICATE AUTO APPROVAL ================= */

const autoApproveCertificates =
  (callback) => {
    const sql = `
      UPDATE certificates
      SET
        status = 'Approved',
        approved_at = NOW(),
        auto_approved = 1
      WHERE status = 'Pending'
        AND requested_at <= DATE_SUB(
          NOW(),
          INTERVAL 12 HOUR
        )
    `;

    db.query(
      sql,
      (err, result) => {
        if (err) {
          console.log(
            "CERTIFICATE AUTO APPROVAL ERROR:",
            err
          );
        } else if (
          result.affectedRows > 0
        ) {
          console.log(
            `🎓 Auto-approved ${result.affectedRows} certificate(s)`
          );
        }

        if (
          typeof callback ===
          "function"
        ) {
          callback(
            err,
            result
          );
        }
      }
    );
  };

/* Check every 5 minutes */

setInterval(
  () => {
    autoApproveCertificates();
  },
  5 * 60 * 1000
);

autoApproveCertificates();

/* ================= ADMIN CERTIFICATES ================= */

app.get(
  "/api/admin/certificates",
  (req, res) => {
    autoApproveCertificates(
      () => {
        const sql = `
          SELECT
            c.id,
            c.certificate_id,
            c.user_id,
            c.test_id,
            c.result_id,
            c.student_name,
            c.test_title,
            c.score,
            c.grade,
            c.status,
            c.requested_at,
            c.approved_at,
            c.auto_approved,
            c.issued_at,
            u.email AS student_email
          FROM certificates c
          LEFT JOIN users u
            ON c.user_id = u.id
          ORDER BY
            CASE
              WHEN c.status = 'Pending'
                THEN 0
              WHEN c.status = 'Approved'
                THEN 1
              ELSE 2
            END,
            c.id DESC
        `;

        db.query(
          sql,
          (err, results) => {
            if (err) {
              console.log(
                "ADMIN CERTIFICATES ERROR:",
                err
              );

              return res.status(500).json({
                message:
                  "Failed to fetch certificates",
                error:
                  err.message,
              });
            }

            res.json({
              certificates:
                results,
            });
          }
        );
      }
    );
  }
);

/* ================= APPROVE CERTIFICATE ================= */

app.put(
  "/api/admin/certificates/:id/approve",
  (req, res) => {
    const certificateId =
      req.params.id;

    const sql = `
      UPDATE certificates
      SET
        status = 'Approved',
        approved_at = NOW(),
        auto_approved = 0
      WHERE id = ?
        AND status = 'Pending'
    `;

    db.query(
      sql,
      [certificateId],
      (err, result) => {
        if (err) {
          console.log(
            "APPROVE CERTIFICATE ERROR:",
            err
          );

          return res.status(500).json({
            message:
              "Failed to approve certificate",
            error: err.message,
          });
        }

        if (
          result.affectedRows === 0
        ) {
          return res.status(404).json({
            message:
              "Pending certificate not found",
          });
        }

        res.json({
          message:
            "Certificate approved successfully",
        });
      }
    );
  }
);

/* ================= REJECT CERTIFICATE ================= */

app.put(
  "/api/admin/certificates/:id/reject",
  (req, res) => {
    const certificateId =
      req.params.id;

    const sql = `
      UPDATE certificates
      SET
        status = 'Rejected',
        approved_at = NULL,
        auto_approved = 0
      WHERE id = ?
        AND status = 'Pending'
    `;

    db.query(
      sql,
      [certificateId],
      (err, result) => {
        if (err) {
          console.log(
            "REJECT CERTIFICATE ERROR:",
            err
          );

          return res.status(500).json({
            message:
              "Failed to reject certificate",
            error: err.message,
          });
        }

        if (
          result.affectedRows === 0
        ) {
          return res.status(404).json({
            message:
              "Pending certificate not found",
          });
        }

        res.json({
          message:
            "Certificate rejected successfully",
        });
      }
    );
  }
);

/* ================= AI DOUBT SOLVER ================= */

app.post(
  "/api/ai/doubt",
  async (req, res) => {
    try {
      const { doubt } =
        req.body;

      if (
        !doubt ||
        !doubt.trim()
      ) {
        return res.status(400).json({
          message:
            "Please enter your doubt",
        });
      }

      if (
        !process.env.GEMINI_API_KEY
      ) {
        return res.status(500).json({
          message:
            "Gemini API key is not configured",
        });
      }

      const response =
        await ai.models.generateContent(
          {
            model:
              "gemini-3.6-flash",

            contents: `
You are an AI Doubt Solver for an Online Test and Learning website.

Help students with:
- Mathematics
- Aptitude
- General Knowledge
- Computer Science
- Programming
- HTML
- CSS
- JavaScript
- React.js
- Other educational topics

Rules:
1. Explain concepts in simple language.
2. Give examples when useful.
3. For programming questions, provide correct code when needed.
4. If the student asks a casual question, answer naturally.
5. Keep answers clear and reasonably short.
6. If the question is unclear, ask the student to clarify.
7. Reply in simple English unless the student asks in Hindi/Hinglish.

Student's doubt:
${doubt.trim()}
`,
          }
        );

      const answer =
        response.text;

      res.json({
        success: true,
        answer,
      });

    } catch (error) {
      console.error(
        "GEMINI AI ERROR:",
        error
      );

      res.status(500).json({
        message:
          "AI response failed",
        error:
          error.message,
      });
    }
  }
);

/* ================= STUDENT CERTIFICATES LIST ================= */

app.get(
  "/api/certificates",
  authenticateToken,
  (req, res) => {
    autoApproveCertificates((autoErr) => {
      if (autoErr) {
        return res.status(500).json({
          message: "Failed to check certificate approval",
          error: autoErr.message,
        });
      }

      const sql = `
        SELECT
          id,
          certificate_id,
          user_id,
          test_id,
          result_id,
          student_name,
          test_title,
          score,
          grade,
          status,
          requested_at,
          approved_at,
          auto_approved,
          issued_at
        FROM certificates
        WHERE user_id = ?
        ORDER BY id DESC
      `;

      db.query(
        sql,
        [req.user.id],
        (err, results) => {
          if (err) {
            console.error(
              "Student certificates error:",
              err
            );

            return res.status(500).json({
              message: "Failed to fetch certificates",
              error: err.message,
            });
          }

          res.json({
            certificates: results,
          });
        }
      );
    });
  }
);

/* ================= STUDENT CERTIFICATE API ================= */

app.get(
  "/api/certificates/:resultId",
  (req, res) => {
    const {
      resultId,
    } = req.params;

    autoApproveCertificates(
      (autoErr) => {
        if (autoErr) {
          return res.status(500).json({
            message:
              "Failed to check certificate approval",
            error:
              autoErr.message,
          });
        }

        const sql = `
          SELECT
            id,
            certificate_id,
            user_id,
            test_id,
            result_id,
            student_name,
            test_title,
            score,
            grade,
            status,
            requested_at,
            approved_at,
            auto_approved,
            issued_at
          FROM certificates
          WHERE result_id = ?
          LIMIT 1
        `;

        db.query(
          sql,
          [resultId],
          (err, rows) => {
            if (err) {
              console.error(
                "Get certificate error:",
                err
              );

              return res.status(500).json({
                message:
                  "Failed to fetch certificate",
                error:
                  err.message,
              });
            }

            if (
              rows.length === 0
            ) {
              return res.status(404).json({
                message:
                  "Certificate request not found",
              });
            }

            const certificate =
              rows[0];

            /* Certificate cannot open before approval */

            if (
              certificate.status !==
              "Approved"
            ) {
              return res.status(403).json({
                status:
                  certificate.status,

                message:
                  certificate.status ===
                  "Pending"
                    ? "Certificate is waiting for admin approval."
                    : "Certificate request was rejected.",
              });
            }

            res.json(
              certificate
            );
          }
        );
      }
    );
  }
);

/* ================= PUBLIC CERTIFICATE VERIFICATION ================= */

app.get(
  "/api/verify-certificate/:certificateId",
  (req, res) => {
    const certificateId =
      req.params.certificateId?.trim();

    if (!certificateId) {
      return res.status(400).json({
        verified: false,
        message: "Certificate ID is required",
      });
    }

    const sql = `
      SELECT
        c.id,
        c.certificate_id,
        c.user_id,
        c.test_id,
        c.result_id,
        c.student_name,
        c.test_title,
        c.score,
        c.grade,
        c.status,
        c.requested_at,
        c.approved_at,
        c.auto_approved,
        c.issued_at
      FROM certificates c
      WHERE c.certificate_id = ?
      LIMIT 1
    `;

    db.query(
      sql,
      [certificateId],
      (err, rows) => {
        if (err) {
          console.error(
            "CERTIFICATE VERIFICATION ERROR:",
            err
          );

          return res.status(500).json({
            verified: false,
            message:
              "Failed to verify certificate",
            error: err.message,
          });
        }

        /* Certificate not found */

        if (rows.length === 0) {
          return res.status(404).json({
            verified: false,
            message:
              "Certificate not found. Please check the Certificate ID.",
          });
        }

        const certificate = rows[0];

        /* Certificate must be approved */

        if (certificate.status !== "Approved") {
          return res.status(403).json({
            verified: false,
            status: certificate.status,
            message:
              certificate.status === "Pending"
                ? "This certificate is still pending approval."
                : "This certificate has been rejected.",
          });
        }

        /* VERIFIED */

        return res.status(200).json({
          verified: true,

          message:
            "Certificate verified successfully",

          certificate: {
            certificate_id:
              certificate.certificate_id,

            student_name:
              certificate.student_name,

            test_title:
              certificate.test_title,

            score:
              Number(certificate.score),

            grade:
              certificate.grade,

            status:
              certificate.status,

            requested_at:
              certificate.requested_at,

            approved_at:
              certificate.approved_at,

            issued_at:
              certificate.issued_at,

            auto_approved:
              Boolean(
                certificate.auto_approved
              ),
          },
        });
      }
    );
  }
);

/* ================= NOTIFICATIONS ================= */

/* GET STUDENT NOTIFICATIONS */
app.get("/api/notifications", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  let decoded;

  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }

  const userId = decoded.id;

  const sql = `
    SELECT
      id,
      title,
      message,
      type,
      is_read,
      created_at
    FROM notifications
    WHERE user_id = ?
       OR user_id IS NULL
    ORDER BY created_at DESC
  `;

  db.query(
    sql,
    [userId],
    (err, results) => {
      if (err) {
        console.log(
          "GET NOTIFICATIONS ERROR:",
          err
        );

        return res.status(500).json({
          message: "Failed to fetch notifications",
          error: err.message,
        });
      }

      res.json({
        notifications: results,
      });
    }
  );
});


/* MARK ONE NOTIFICATION AS READ */
app.put(
  "/api/notifications/:id/read",
  (req, res) => {
    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token =
      authHeader.split(" ")[1];

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    const userId = decoded.id;
    const notificationId = req.params.id;

    const sql = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = ?
        AND (user_id = ? OR user_id IS NULL)
    `;

    db.query(
      sql,
      [notificationId, userId],
      (err, result) => {
        if (err) {
          console.log(
            "MARK NOTIFICATION ERROR:",
            err
          );

          return res.status(500).json({
            message:
              "Failed to mark notification as read",
            error: err.message,
          });
        }

        res.json({
          message:
            "Notification marked as read",
        });
      }
    );
  }
);


/* MARK ALL NOTIFICATIONS AS READ */
app.put(
  "/api/notifications/read-all",
  (req, res) => {
    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token =
      authHeader.split(" ")[1];

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    const userId = decoded.id;

    const sql = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = ?
         OR user_id IS NULL
    `;

    db.query(
      sql,
      [userId],
      (err) => {
        if (err) {
          console.log(
            "MARK ALL NOTIFICATIONS ERROR:",
            err
          );

          return res.status(500).json({
            message:
              "Failed to mark all notifications as read",
            error: err.message,
          });
        }

        res.json({
          message:
            "All notifications marked as read",
        });
      }
    );
  }
);

/* ================= NOTIFICATION STUDENTS ================= */

app.get(
  "/api/admin/notification-students",
  (req, res) => {

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token =
      authHeader.split(" ")[1];

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return res.status(401).json({
        message:
          "Invalid or expired token",
      });
    }

    if (decoded.role !== "admin") {
      return res.status(403).json({
        message:
          "Access denied. Admin only.",
      });
    }

    const sql = `
      SELECT
        id,
        name,
        email
      FROM users
      WHERE role != 'admin'
      ORDER BY name ASC
    `;

    db.query(
      sql,
      (err, results) => {

        if (err) {
          console.log(
            "NOTIFICATION STUDENTS ERROR:",
            err
          );

          return res.status(500).json({
            message:
              "Failed to fetch students",
            error: err.message,
          });
        }

        res.json({
          students: results,
        });
      }
    );
  }
);

/* ================= ADMIN SEND NOTIFICATION ================= */

app.post("/api/admin/notifications", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  let decoded;

  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }

  if (decoded.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required",
    });
  }

  const {
    user_id,
    title,
    message,
    type,
  } = req.body;

  if (!title || !message) {
    return res.status(400).json({
      message: "Title and message are required",
    });
  }

  const sql = `
    INSERT INTO notifications
    (
      user_id,
      title,
      message,
      type
    )
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      user_id || null,
      title.trim(),
      message.trim(),
      type || "general",
    ],
    (err, result) => {
      if (err) {
        console.log(
          "ADMIN SEND NOTIFICATION ERROR:",
          err
        );

        return res.status(500).json({
          message: "Failed to save notification",
          error: err.message,
        });
      }

      res.status(201).json({
        message: "Notification sent successfully",
        notificationId: result.insertId,
      });
    }
  );
});

// =====================================================
// ABOUT PAGE - LIVE STATS
// =====================================================

app.get("/api/about/stats", (req, res) => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM users WHERE role = 'student') AS total_students,
      (SELECT COUNT(*) FROM results) AS total_attempts,
      (SELECT COUNT(*) FROM tests) AS total_tests
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("About stats error:", err);

      return res.status(500).json({
        message: "Failed to fetch live statistics",
        error: err.message,
      });
    }

    const stats = results[0];

    res.json({
      students: Number(stats.total_students || 0),
      attempts: Number(stats.total_attempts || 0),
      tests: Number(stats.total_tests || 0),
      satisfaction: 95,
      access: "24/7",
    });
  });
});

// =====================================================
// CONTACT US - INFO
// =====================================================

app.get("/api/contact/info", (req, res) => {
  res.json({
    email:
      process.env.SUPPORT_EMAILS?.split(",")[0]?.trim() ||
      process.env.EMAIL_USER,

    phone: "+91 6396200316",

    location:
      "Haridwar, Uttarakhand, India",

    hours:
      "24/7 Online Support",
  });
});


// =====================================================
// CONTACT US - SEND MESSAGE
// =====================================================

app.post("/api/contact", async (req, res) => {
  try {
    const {
      name,
      email,
      subject,
      message,
    } = req.body;

    // -------------------------------
    // VALIDATION
    // -------------------------------

    if (
      !name ||
      !email ||
      !subject ||
      !message
    ) {
      return res.status(400).json({
        message:
          "All fields are required.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    // -------------------------------
    // GMAIL VALIDATION
    // -------------------------------

    if (
      !cleanEmail.endsWith("@gmail.com")
    ) {
      return res.status(400).json({
        message:
          "Please enter a valid Gmail address.",
      });
    }

    // -------------------------------
    // MESSAGE LENGTH
    // -------------------------------

    if (cleanMessage.length < 10) {
      return res.status(400).json({
        message:
          "Message must contain at least 10 characters.",
      });
    }

    // -------------------------------
    // SUPPORT EMAILS
    // -------------------------------

    const supportEmails = (
      process.env.SUPPORT_EMAILS ||
      process.env.EMAIL_USER ||
      ""
    )
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);

    if (supportEmails.length === 0) {
      return res.status(500).json({
        message:
          "Support email is not configured.",
      });
    }

    // =================================================
    // SAVE MESSAGE IN MYSQL
    // =================================================

    const insertSql = `
      INSERT INTO contact_messages
      (
        name,
        email,
        subject,
        message
      )
      VALUES (?, ?, ?, ?)
    `;

    db.query(
      insertSql,
      [
        cleanName,
        cleanEmail,
        cleanSubject,
        cleanMessage,
      ],
      async (dbError, result) => {

        if (dbError) {
          console.error(
            "CONTACT DATABASE ERROR:",
            dbError
          );

          return res.status(500).json({
            message:
              "Failed to save your message.",
          });
        }

        const messageId =
          result.insertId;

        // =================================================
        // EMAIL TO ALL SUPPORT GMAIL ACCOUNTS
        // =================================================

        try {
          await transporter.sendMail({
            from:
              `"TestHub Contact" <${process.env.EMAIL_USER}>`,

            to: supportEmails.join(", "),

            replyTo: cleanEmail,

            subject:
              `📩 New Contact Message #${messageId} - ${cleanSubject}`,

            html: `
              <div style="
                font-family: Arial, sans-serif;
                max-width: 650px;
                margin: auto;
                background: #f5f8fc;
                padding: 30px;
              ">

                <div style="
                  background: white;
                  border-radius: 16px;
                  padding: 30px;
                  border: 1px solid #e4ebf3;
                ">

                  <div style="
                    text-align: center;
                    margin-bottom: 25px;
                  ">
                    <div style="
                      font-size: 42px;
                    ">
                      📩
                    </div>

                    <h1 style="
                      color: #1473e6;
                      margin: 8px 0;
                    ">
                      New Contact Message
                    </h1>

                    <p style="
                      color: #7b8da3;
                      font-size: 13px;
                    ">
                      TestHub Contact Us
                    </p>
                  </div>

                  <div style="
                    background: #f5f9ff;
                    padding: 18px;
                    border-radius: 12px;
                    margin-bottom: 20px;
                  ">

                    <p style="
                      margin: 7px 0;
                    ">
                      <strong>
                        Message ID:
                      </strong>
                      #${messageId}
                    </p>

                    <p style="
                      margin: 7px 0;
                    ">
                      <strong>
                        Name:
                      </strong>
                      ${cleanName}
                    </p>

                    <p style="
                      margin: 7px 0;
                    ">
                      <strong>
                        Gmail:
                      </strong>
                      ${cleanEmail}
                    </p>

                    <p style="
                      margin: 7px 0;
                    ">
                      <strong>
                        Subject:
                      </strong>
                      ${cleanSubject}
                    </p>

                  </div>

                  <h3 style="
                    color: #263a52;
                  ">
                    Student Message
                  </h3>

                  <div style="
                    background: #ffffff;
                    border: 1px solid #e3eaf2;
                    border-radius: 10px;
                    padding: 18px;
                    color: #53647b;
                    line-height: 1.7;
                    white-space: pre-wrap;
                  ">
                    ${cleanMessage}
                  </div>

                  <div style="
                    margin-top: 25px;
                    padding: 15px;
                    background: #edf6ff;
                    border-radius: 10px;
                    color: #52677e;
                    font-size: 12px;
                  ">
                    💡 You can simply use
                    <strong>Reply</strong>
                    to respond directly to
                    ${cleanEmail}.
                  </div>

                  <hr style="
                    border: none;
                    border-top: 1px solid #e8edf3;
                    margin: 25px 0;
                  ">

                  <p style="
                    text-align: center;
                    color: #8a99aa;
                    font-size: 11px;
                    margin: 0;
                  ">
                    TestHub Support System
                  </p>

                </div>

              </div>
            `,
          });

          console.log(
            `CONTACT EMAIL SENT TO: ${supportEmails.join(", ")}`
          );

        } catch (emailError) {

          console.error(
            "CONTACT SUPPORT EMAIL ERROR:",
            emailError
          );

          // Message database me save ho chuka hai,
          // isliye user ko database failure nahi dikhayenge.
        }

        // =================================================
        // CONFIRMATION EMAIL TO STUDENT
        // =================================================

        try {

          await transporter.sendMail({
            from:
              `"TestHub Support" <${process.env.EMAIL_USER}>`,

            to: cleanEmail,

            subject:
              "✅ TestHub – We Received Your Message",

            html: `
              <div style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: auto;
                padding: 30px;
                background: #f5f8fc;
              ">

                <div style="
                  background: white;
                  padding: 32px;
                  border-radius: 16px;
                  border: 1px solid #e4ebf3;
                ">

                  <div style="
                    text-align: center;
                    font-size: 42px;
                  ">
                    ✅
                  </div>

                  <h1 style="
                    text-align: center;
                    color: #1473e6;
                  ">
                    Message Received!
                  </h1>

                  <p style="
                    color: #333;
                    font-size: 15px;
                  ">
                    Hello
                    <strong>
                      ${cleanName}
                    </strong>,
                  </p>

                  <p style="
                    color: #596b80;
                    line-height: 1.7;
                  ">
                    Thank you for contacting
                    TestHub. We have successfully
                    received your message.
                  </p>

                  <div style="
                    background: #edf6ff;
                    padding: 18px;
                    border-radius: 12px;
                    margin: 22px 0;
                  ">

                    <p style="
                      margin: 6px 0;
                    ">
                      <strong>
                        Message ID:
                      </strong>
                      #${messageId}
                    </p>

                    <p style="
                      margin: 6px 0;
                    ">
                      <strong>
                        Subject:
                      </strong>
                      ${cleanSubject}
                    </p>

                  </div>

                  <p style="
                    color: #596b80;
                    line-height: 1.7;
                  ">
                    Our support team will review
                    your message and get back to
                    you through email.
                  </p>

                  <p style="
                    color: #596b80;
                    line-height: 1.7;
                  ">
                    Please keep your Message ID
                    <strong>
                      #${messageId}
                    </strong>
                    for reference.
                  </p>

                  <hr style="
                    border: none;
                    border-top: 1px solid #eee;
                    margin: 25px 0;
                  ">

                  <p style="
                    text-align: center;
                    color: #777;
                    font-size: 12px;
                  ">
                    Thank you for using TestHub 🎓
                  </p>

                </div>

              </div>
            `,
          });

          console.log(
            `CONFIRMATION EMAIL SENT TO: ${cleanEmail}`
          );

        } catch (confirmationError) {

          console.error(
            "STUDENT CONFIRMATION EMAIL ERROR:",
            confirmationError
          );
        }

        // =================================================
        // FINAL RESPONSE
        // =================================================

        return res.status(201).json({
          message:
            "Your message has been sent successfully!",
          messageId,
        });
      }
    );

  } catch (error) {

    console.error(
      "CONTACT API ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong. Please try again.",
    });
  }
});

// ================= SERVER START =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Online Test API running on port ${PORT}`);
});