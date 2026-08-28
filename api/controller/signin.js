const service = require("../service/signin");

const signin = async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    if (!employeeId || !password) {
      return res.status(400).json({
        success: false,
        message: "employeeId and password are required",
      });
    }

    const result = await service.signin(employeeId, password);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    // More specific error handling
    if (error.message.includes("inactive")) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { signin };
