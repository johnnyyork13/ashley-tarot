const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
    organization: "org-LvsjgDixWQdrOYEiy3RonSbA",
    project: "proj_VnmoDn7r81RC1JE6DBrz1zmj"
})

router.post("/ai", async(req, res, next) => {
    const model = "gpt-4o-mini";

    const completion = await openai.chat.completions.create({
        messages: req.body.messages,
        model: model,
    });
    const updatedMessages = req.body.messages.concat(completion.choices[0].message);
    // console.log(completion.choices[0]);
    res.json({messages: updatedMessages})
})


module.exports = router;
