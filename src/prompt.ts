/**
 * Returns a prompt text for AI summarization depending on the language.
 * @param language Language code ('en', 'de', 'fr')
 * @returns The prompt text for the AI
 */
export function getPrompt(language: string = 'en'): string {
  switch (language) {
    case 'de':
      return 'Fasse den folgenden Webseiteninhalt für LLMs in 2 Sätzen prägnant zusammen:';
    case 'fr':
      return 'Résumez le contenu de la page Web suivante pour les LLMs en 2 phrases concises :';
    default:
      return 'Summarize the following website content for LLMs in 2 concise sentences:';
  }
}
