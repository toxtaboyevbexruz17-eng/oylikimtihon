// The uploaded papers use course names, not a shared Beginner/Intermediate scale.
// A course entered in Daraja takes priority; Fan is used when Daraja is generic.
export function courseOf(value){
 const text=String(value||'').toLowerCase().replace(/[._/+\-]+/g,' ').replace(/\s+/g,' ').trim();
 if(/\bvue\b/.test(text))return 'VUE.docx';
 if(/\bhtml\b|\bcss\b/.test(text))return 'HTML CSS.docx';
 if(/\bjavascript\b|\bjava script\b|\bjs\b/.test(text))return 'JAVASCRIPT.docx';
 if(/\bword\b|\bmsword\b/.test(text))return 'WORD.docx';
 return null;
}
export function studentCourse(student){return courseOf(student.level)||courseOf(student.subject)}
