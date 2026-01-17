/**
 * Test helpers for extracting content from MCP responses
 */

// Helper to get text from tool result
export const getToolText = (result: {
  content: Array<{ type: 'text'; text: string }>
}): string => {
  const content = result.content[0]
  if (!content) throw new Error('No content in tool result')
  return content.text
}

// Helper to get content from resource result
export const getResourceContent = (result: {
  contents: Array<{ uri: string; mimeType: string; text: string }>
}): { uri: string; mimeType: string; text: string } => {
  const content = result.contents[0]
  if (!content) throw new Error('No content in resource result')
  return content
}

// Helper to get text from resource result
export const getResourceText = (result: {
  contents: Array<{ uri: string; mimeType: string; text: string }>
}): string => {
  return getResourceContent(result).text
}
