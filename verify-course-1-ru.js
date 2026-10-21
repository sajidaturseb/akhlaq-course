// Run before publishing changes to the Russian translation of course 1.
// This checks structure and answer keys; meaning still requires human review.
global.window = {};
for (const file of ["lessons.js", "study-texts.js", "review-curated.js", "course-1-ru.js"]) {
  require(`./${file}`);
}

const errors = [];
const tatar = window.AKHLAQ_LESSONS;
const russian = window.AKHLAQ_COURSE_1_RU;

if (!Array.isArray(tatar) || tatar.length !== 22) {
  errors.push("Expected exactly 22 Tatar lessons in course 1.");
}

for (let number = 1; number <= 22; number += 1) {
  const source = tatar.find((lesson) => lesson.n === number);
  const target = russian?.[number];
  if (!source || !target) {
    errors.push(`Lesson ${number}: missing Tatar or Russian version.`);
    continue;
  }

  const study = window.AKHLAQ_STUDY?.[1]?.[number]?.study || source.study;
  const review = window.AKHLAQ_REVIEW_CURATED?.[1]?.[number] || source.review;
  if (review?.length !== 5 || source.questions?.length !== 4) {
    errors.push(`Lesson ${number}: expected five review questions and four test questions.`);
  }
  for (const field of ["title", "intro", "verse", "task", "reflection"]) {
    if (!target[field]?.trim()) {
      errors.push(`Lesson ${number}: ${field} is missing.`);
    }
  }
  for (const [name, original, translation] of [
    ["study paragraphs", study, target.study],
    ["review questions", review, target.review],
    ["test questions", source.questions, target.questions]
  ]) {
    if (!Array.isArray(original) || !Array.isArray(translation) || original.length !== translation.length) {
      errors.push(`Lesson ${number}: ${name} count differs.`);
    }
  }

  for (const [index, item] of (target.review || []).entries()) {
    if (!item.q?.trim() || !item.a?.trim()) {
      errors.push(`Lesson ${number}, review ${index + 1}: question or answer missing.`);
    }
  }

  for (const [index, item] of (source.questions || []).entries()) {
    const translated = target.questions?.[index];
    if (!translated || item.a !== translated.a || item.o?.length !== translated.o?.length || !translated.e?.trim()) {
      errors.push(`Lesson ${number}, test ${index + 1}: options, answer key or explanation differ.`);
    } else if (!translated.q?.trim() || translated.o.some((option) => !option?.trim())) {
      errors.push(`Lesson ${number}, test ${index + 1}: question or option is empty.`);
    }
  }
}

for (const [lesson, phrase] of [
  [14, "фәрештәләр догасы кебек"],
  [15, "Эшләрнең хәерлесе — урта юлдыр"]
]) {
  const tatarContent = JSON.stringify({
    study: window.AKHLAQ_STUDY[1][lesson].study,
    review: window.AKHLAQ_REVIEW_CURATED[1][lesson],
    questions: tatar.find((item) => item.n === lesson).questions
  });
  if (tatarContent.includes(phrase)) {
    errors.push(`Lesson ${lesson}: disputed source wording remains in Tatar.`);
  }
}
if (JSON.stringify(russian[14]).includes("подобно мольбе ангелов") ||
    JSON.stringify(russian[15]).includes("Лучшее в делах — срединный путь")) {
  errors.push("Disputed source wording remains in Russian lessons 14 or 15.");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Course 1 Russian/Tatar structure and answer keys match across all 22 lessons.");
}
