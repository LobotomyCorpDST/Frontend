/**
 * Calculate Levenshtein distance between two strings
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} - Levenshtein distance
 */
function levenshteinDistance(a, b) {
  const matrix = [];

  // Initialize first column of matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // Initialize first row of matrix
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate fuzzy match score between query and target string
 * Lower score = better match
 * @param {string} query - Search query
 * @param {string} target - Target string to match against
 * @returns {number} - Match score (0 = exact match, higher = worse match)
 */
export function fuzzyMatchScore(query, target) {
  if (!query || !target) return Infinity;

  const queryLower = query.toLowerCase();
  const targetLower = target.toLowerCase();

  // Exact match gets best score
  if (targetLower === queryLower) return 0;

  // Starts with query gets second-best score
  if (targetLower.startsWith(queryLower)) return 1;

  // Contains query gets third-best score
  if (targetLower.includes(queryLower)) return 2;

  // Use Levenshtein distance for fuzzy matching
  const distance = levenshteinDistance(queryLower, targetLower);

  // Normalize distance by target length to handle different string lengths
  const normalizedDistance = distance / Math.max(queryLower.length, targetLower.length);

  return 3 + normalizedDistance;
}

/**
 * Filter and sort options by fuzzy match score
 * @param {Array} options - Array of option objects with searchText property
 * @param {string} query - Search query
 * @param {number} maxResults - Maximum number of results to return (default: 10)
 * @returns {Array} - Filtered and sorted options
 */
export function fuzzyFilter(options, query, maxResults = 10) {
  if (!query || query.trim() === '') return options.slice(0, maxResults);

  // Calculate match score for each option
  const scored = options.map(option => ({
    ...option,
    score: fuzzyMatchScore(query, option.searchText || option.label || '')
  }));

  // Filter out poor matches (score > 10) and sort by score
  const filtered = scored
    .filter(item => item.score < 10)
    .sort((a, b) => a.score - b.score)
    .slice(0, maxResults);

  return filtered;
}

/**
 * Highlight matching characters in text
 * @param {string} text - Text to highlight
 * @param {string} query - Search query
 * @returns {string} - HTML string with highlighted matches
 */
export function highlightMatch(text, query) {
  if (!query || !text) return text;

  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  const startIndex = textLower.indexOf(queryLower);

  if (startIndex !== -1) {
    // Exact substring match - highlight the whole query
    return (
      text.substring(0, startIndex) +
      '<strong>' + text.substring(startIndex, startIndex + query.length) + '</strong>' +
      text.substring(startIndex + query.length)
    );
  }

  // Fuzzy match - highlight individual matching characters
  let result = '';
  let queryIndex = 0;

  for (let i = 0; i < text.length; i++) {
    if (queryIndex < query.length && text[i].toLowerCase() === queryLower[queryIndex]) {
      result += '<strong>' + text[i] + '</strong>';
      queryIndex++;
    } else {
      result += text[i];
    }
  }

  return result;
}
