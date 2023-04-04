import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
const basePromptPrefix = `
Please rate my spoken English.
I will give you the text of my spoken English.

There are five grades: A, B, C, D, and E.
Please grade me on vocabulary, grammar, and overall.

Also, please indicate in detail what is good and what is wrong, and how it can be improved.

Format of output is as follows:



Ovaerall: 
Vocabulary:
Grammar:

What is wrong:
Good points:
How to improve:
`;

const generateAction = async (req, res) => {
  // const { userInputAudiotext } = req.body;
  console.log(`API: ${basePromptPrefix}
  
 `);

  const baseCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "Behave like an English speaking teacher" },
      {
        role: "user",
        content: `${basePromptPrefix}
        The text of my spoken English: ${req.body}
        
      
       
        `,
      },
    ],
  });
  console.log("baseCompletion: " + baseCompletion.data.choices[0].message);

  const basePromptOutput = baseCompletion.data.choices[0].message.content;
  console.log("basePromptOutPut: " + basePromptOutput);

  res.status(200).json({ output: basePromptOutput, status: 200 });
};

export default generateAction;
