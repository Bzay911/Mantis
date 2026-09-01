export default function formatDate(dateInput: string | Date) {
  const date = new Date(dateInput);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }); // → "12 Jun 2020"
}