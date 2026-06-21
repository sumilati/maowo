import ZAI from 'z-ai-web-dev-sdk'

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

export async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

// LLM 文本生成
export async function llmChat(systemPrompt: string, userMessage: string): Promise<string> {
  const zai = await getZAI()
  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'assistant', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    thinking: { type: 'disabled' },
  })
  return completion.choices[0]?.message?.content ?? ''
}

// VLM 看图说话
export async function vlmChat(prompt: string, imageUrl: string): Promise<string> {
  const zai = await getZAI()
  const response = await zai.chat.completions.createVision({
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      },
    ],
    thinking: { type: 'disabled' },
  })
  return response.choices[0]?.message?.content ?? ''
}

// 图片生成，返回 base64
export async function generateImageBase64(prompt: string, size: string = '1024x1024'): Promise<string> {
  const zai = await getZAI()
  const response = await zai.images.generations.create({
    prompt,
    size: size as '1024x1024' | '768x1344' | '864x1152' | '1344x768' | '1152x864' | '1440x720' | '720x1440',
  })
  return response.data[0]?.base64 ?? ''
}
