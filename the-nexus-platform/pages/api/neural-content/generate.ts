import { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { prompt, contentType, companyData } = req.body

    const systemPrompt = `You are an AI content generator for a cutting-edge IT company. 
    Generate professional, technical content that showcases innovation and expertise.
    Content type: ${contentType}
    Company data context: ${JSON.stringify(companyData)}`

    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    })

    const generatedContent = completion.data.choices[0]?.message?.content

    if (!generatedContent) {
      throw new Error('No content generated')
    }

    // Store in vector database for future retrieval
    // await storeInVectorDB(generatedContent, companyData)

    res.status(200).json({
      success: true,
      content: generatedContent,
      metadata: {
        contentType,
        generatedAt: new Date().toISOString(),
        tokenCount: completion.data.usage?.total_tokens
      }
    })
  } catch (error) {
    console.error('Content generation error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to generate content'
    })
  }
}