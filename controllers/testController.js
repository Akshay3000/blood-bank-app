const testController = (req, res) => {
    res.status(200).send({
        message: "test Route",
        success: true,
    });
};

module.exports = { testController };