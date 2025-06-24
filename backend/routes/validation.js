const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateUser = (req, res, next) => {
    const { body: { firstName, lastName, email, password }} = req;
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please enter a valid email address format (e.g., user@domain.com)." });
    }

    next();
};

module.exports = {
    validateUser,
};
