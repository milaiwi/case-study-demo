import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
    try {
        const { documentName, documentContent, systemPrompt } = await request.json()

        if (!documentContent) {
            return NextResponse.json(
                { error: 'Document content is required' },
                { status: 400 }
            )
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'OpenAI API key not configured' },
                { status: 500 }
            )
        }

        const maxContentLength = 100000 // Leave room for system prompt and response
        const truncatedContent = documentContent.length > maxContentLength 
            ? documentContent.substring(0, maxContentLength) + '\n\n[Content truncated due to length]'
            : documentContent

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: `Please analyze the following document: "${documentName}"\n\nDocument content:\n${truncatedContent}`
                }
            ],
            temperature: 0.1,
            max_tokens: 4000,
            response_format: { type: 'json_object' }
        })

        const responseContent = completion.choices[0]?.message?.content

        if (!responseContent) {
            throw new Error('No response content received from OpenAI')
        }

        // Parse the JSON response
        let analysis
        try {
            analysis = JSON.parse(responseContent)
        } catch (parseError) {
            console.error('Failed to parse OpenAI response as JSON:', responseContent)
            throw new Error('Invalid JSON response from AI analysis')
        }

        // Validate the response structure
        const requiredFields = ['regulatoryLegalRisks', 'investmentRisks', 'potentialDownsides', 'summary']
        const missingFields = requiredFields.filter(field => !analysis[field])
        
        if (missingFields.length > 0) {
            throw new Error(`Missing required fields in AI response: ${missingFields.join(', ')}`)
        }

        return NextResponse.json({
            success: true,
            analysis,
            documentName,
            tokensUsed: completion.usage?.total_tokens || 0
        })

    } catch (error) {
        console.error('Error in PDF analysis API:', error)
        
        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }
        
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        )
    }
} 