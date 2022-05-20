const Feedback = require("../../models/feedback.Model")

exports.createFeedback = async (req, res) => {
    console.log("abc")
    try {
        let newFeedback = new Feedback({
            email: req.body.email,
            title: req.body.title,
            message: req.body.message,
            user: req.body.user
        })
        await newFeedback.save()
        res.status(200).json({
            newFeedback
        })
    } catch (error) {
        res.status(500).json({
            Message: error
        })
    }
}
exports.findFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find({}).populate({ path: 'user' })
        if (feedback) {
            res.status(200).json({
                feedback
            })
        } else {
            res.status(404).json({
                Message: "Feedback not found"
            })
        }
    } catch (error) {
        res.status(500).json({
            Message: error
        })
    }
}

exports.updateFeedback = async (req, res) => {
    try {
        const feedbackUpdate = await Feedback.findOneAndUpdate({ _id: req.body.id }, { status: req.body.status }, { new: true })
        if (feedbackUpdate) {
            res.status(200).json({
                feedbackUpdate
            })

        } else (
            res.status(404).json({
                Message: "Update failed"
            })
        )
    } catch (error) {
        res.status(500).json({
            Message: error
        })
    }
}

exports.deleteFeedback = async (req, res) => {
    try {
        await Feedback.findOneAndDelete({ _id: req.body.id }, (err, docs) => {
            if (err) {
                res.status(500).json({
                    Message: err
                })
            }
            else {
                res.status(200).json({
                    Message: `Deleted Feedback: ${docs}`
                })
            }
        })

    } catch (error) {

    }
}

exports.getDetailFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findById({ _id: req.body.id})
        if (feedback) {
            res.status(200).json({
                feedback
            })
        } else {
            res.status(404).json({
                Message: "Feedback not Found"
            })
        }
    } catch (error) {
        res.status(500).json({
            error
        })
    }
}