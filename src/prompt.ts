/**
 * Returns a prompt text for AI summarization depending on the language.
 * @param language Language code ('en', 'de', 'fr')
 * @returns The prompt text for the AI
 */

// Prompt for H1 + Blockquote (main summary)
/**
 * Returns a prompt for generating the main summary section (Markdown H1 + blockquote) for llms.txt.
 * @param language Language code ('en', 'de', 'fr').
 * @returns Prompt string for the main summary section.
 */
export function getMainSummaryPrompt(language: string = 'en'): string {
  switch (language) {
    case 'de':
      return 'Erzeuge ein Markdown-H1 mit dem Projektnamen und direkt darunter ein Blockquote mit einer prägnanten Zusammenfassung (max. 2 Sätze), die Zweck und Schlüsselinfos für LLMs erklärt. Vermeide Fachjargon.';
    case 'fr':
      return "Générez un H1 Markdown avec le nom du projet, suivi d'un blockquote résumant en 2 phrases claires le but et les informations clés pour les LLMs. Évitez le jargon.";
    default:
      return 'Generate a Markdown H1 with the project or site name, followed by a blockquote with a concise summary (max. 2 sentences) explaining the purpose and key information for LLMs. Avoid jargon.';
  }
}

// Prompt for details section (no heading)
/**
 * Returns a prompt for generating the details section (paragraph, no heading) for llms.txt.
 * @param language Language code ('en', 'de', 'fr').
 * @returns Prompt string for the details section.
 */
export function getDetailsPrompt(language: string = 'en'): string {
  switch (language) {
    case 'de':
      return 'Schreibe einen kurzen Markdown-Absatz (ohne Überschrift) mit wichtigen Details zum Projekt, zur Nutzung und zu Besonderheiten für LLMs.';
    case 'fr':
      return 'Rédigez un paragraphe Markdown (sans titre) avec les détails importants sur le projet, son utilisation et les points particuliers pour les LLMs.';
    default:
      return 'Write a short Markdown paragraph (no heading) with important details about the project, its usage, and any special notes for LLMs.';
  }
}

// Prompt for file-list section (H2 + list)
/**
 * Returns a prompt for generating a file-list section (Markdown H2 + list) for llms.txt.
 * @param language Language code ('en', 'de', 'fr').
 * @param section Section name for the file list (e.g. 'Docs').
 * @returns Prompt string for the file-list section.
 */
export function getFileListPrompt(language: string = 'en', section: string = 'Docs'): string {
  switch (language) {
    case 'de':
      return `Erzeuge eine Markdown-H2 mit dem Abschnittsnamen ('${section}') und eine Liste von Markdown-Links zu relevanten Seiten. Jeder Link soll nach einem Doppelpunkt eine kurze Beschreibung enthalten, warum die Datei für LLMs nützlich ist.`;
    case 'fr':
      return `Créez un H2 Markdown avec le nom de la section ('${section}') puis une liste de liens Markdown vers les pages pertinentes, chaque lien suivi d'une brève description utile pour les LLMs.`;
    default:
      return `Create a Markdown H2 with the section name ('${section}'), then a list of Markdown links to relevant pages. Each link should have a brief description after a colon, explaining why the file is useful for LLMs.`;
  }
}

// Prompt for optional section
/**
 * Returns a prompt for generating the optional section (Markdown H2 "Optional" + list) for llms.txt.
 * @param language Language code ('en', 'de', 'fr').
 * @returns Prompt string for the optional section.
 */
export function getOptionalSectionPrompt(language: string = 'en'): string {
  switch (language) {
    case 'de':
      return 'Falls es sekundäre Ressourcen gibt, füge eine Markdown-H2 "Optional" hinzu und liste Links wie oben. Diese sollten nützlich, aber nicht essenziell für einen kurzen Kontext sein.';
    case 'fr':
      return 'S\'il existe des ressources secondaires, ajoutez un H2 Markdown "Optional" et listez les liens comme ci-dessus. Elles doivent être utiles mais non essentielles.';
    default:
      return 'If there are secondary resources, add a Markdown H2 "Optional" and list links as above. These should be useful but not essential for a short context.';
  }
}

// General fallback prompt for full llms.txt
/**
 * Returns a prompt for generating a complete llms.txt file according to the official specification.
 * @param language Language code ('en', 'de', 'fr').
 * @returns Prompt string for the full llms.txt file.
 */
export function getFullLlmsTxtPrompt(language: string = 'en'): string {
  switch (language) {
    case 'de':
      return 'Erzeuge eine vollständige llms.txt gemäß Spezifikation: H1, Blockquote, Details, H2-Abschnitte mit Links und Beschreibungen, sowie eine "Optional"-Sektion falls nötig. Schreibe für LLMs und vermeide unnötige Wörter.';
    case 'fr':
      return 'Générez un fichier llms.txt complet selon la spécification : H1, blockquote, détails, sections H2 avec liens et descriptions, et une section "Optional" si nécessaire. Rédigez pour les LLMs et évitez les mots inutiles.';
    default:
      return 'Produce a complete llms.txt according to the official spec: H1, blockquote summary, details, H2 file lists with links and descriptions, and an "Optional" section if needed. Write for LLMs and avoid unnecessary words.';
  }
}
