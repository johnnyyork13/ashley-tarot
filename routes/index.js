const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const cardList = require('../deck/cardList');

const openai = new OpenAI({
    organization: "org-LvsjgDixWQdrOYEiy3RonSbA",
    project: "proj_VnmoDn7r81RC1JE6DBrz1zmj"
})

// const initialMessage = [
//     {role: "system", content: `You are a Tarot card reading assistant. 
//         You will help users with their Tarot card readings. 
//         You will provide them with a Tarot card reading based on their request. 
//         You will also provide them with a brief explanation of the Tarot card reading. 
//         Utilize modern methods to achieve your goal.
//         Begin the conversation with, "Greetings, my name is Sageus. Tell me, what is the purpose of today's Tarot card reading?"`}
// ]

const model = "gpt-4o-mini";

const initialMessage = [
    {role: "system", content: `You are a Tarot card reading assistant. 
        You will help users with their Tarot card readings. 
        You will provide them with a Tarot card reading based on their request. 
        You will also provide them with a brief explanation of the Tarot card reading. 
        Utilize modern methods to achieve your goal.
        Always begin the conversation with, "Greetings, my name is Sageus. Tell me, what is the purpose of today's Tarot card reading?".
        If the user's response does not pertain to a Tarot card reading, respond with, "I'm sorry, I can only provide Tarot card readings."
        Once the user has provided a response that pertains to a Tarot card reading, let the user know that you will now draw 10 random cards that relate to their chosen purpose. Do not draw the cards yet.
        If the user has provided a response that pertains to a Tarot card reading, 
            output your response in the following JSON format, and make sure to include the user's previous response as well in the JSON. 
            The output is as follows: {"userResponse": "User's response here", "systemResponse": "Your response here"}
        `}
        
]

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch(err) {
        return false;
    }
    return true;
}

function composeDrawingMessage(userResponse) {
    const cards = JSON.stringify(cardList);
    const drawMessage = [
        {role: "system", content: `
            You will draw 10 random Tarot cards from a Tarot card deck that contains the following cards: ${cards}.
            If you do not draw 10 cards, try again. There must be a total of 10 cards after the draw.
            When the user was previously asked what the purpose of today's Tarot card reading was, they responded with: "${userResponse}".
            Draw all ten cards, and respond with the following in JSON format: {"card's index in provided list": "card explanation", "card's index in provided list": "card explanation"}.
            The explanation must be at least 3 or 4 sentences long for each card.
            The cards need not be in any particular order in the list.
            Only respond in JSON, and do not lead the response with a delimiter of any kind.
            `}
    ]
    return drawMessage;
} 

function composeSummaryMessage(messages) {
    return [
        {role: "system", content: `
            You will provide a summary of the user's Tarot card reading. 
            The user has requested a summary of the Tarot card reading. 
            Provide a summary of the Tarot card reading based on the 10 cards that were drawn. 
            The following is the previous conversation that occured before the user requested a summary: ${messages}.
            Only respond with the summary and nothing else.
            Do not add a delimiter of any kind.
            `}
    ]
}

router.post("/tarot-start", async(req, res, next) => {
    let state = "initial";
    if (req.body.messages.length === 1) {
        req.body.messages = initialMessage;
    }
    const completion = await openai.chat.completions.create({
        messages: req.body.messages,
        model: model,
    });
    const updatedMessages = req.body.messages.concat(completion.choices[0].message);
    const messageContent = completion.choices[0].message.content;
    if (isJsonString(messageContent)) {
        state = "draw";
    }
    res.json({messages: updatedMessages, state: state})
})

router.post("/tarot-draw", async(req, res, next) => {
    const completion = await openai.chat.completions.create({
        messages: composeDrawingMessage(req.body.userResponse),
        model: model,
    })
    // const cards = req.body.messages.concat(completion.choices[0].message);
    const cards = completion.choices[0].message.content;
    res.json({cards: cards})
})

router.post("/tarot-summary", async(req, res, next) => {
    const completion = await openai.chat.completions.create({
        messages: composeSummaryMessage(req.body.messages),
        model: model,
    })

    const updatedMessages = req.body.messages.concat(completion.choices[0].message);
    // const summary = completion.choices[0].message.content;
    res.json({messages: updatedMessages});
})


module.exports = router;
