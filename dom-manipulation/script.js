// ===== Dynamic Quote Generator with Web Storage, JSON Handling, and Filtering =====

let quotes = [];

// Load quotes from localStorage or initialize default
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
      { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" }
    ];
    saveQuotes();
  }
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
  populateCategories();
}

function showRandomQuote() {
  const display = document.getElementById("quoteDisplay");
  const selectedCategory = document.getElementById("categoryFilter").value;
  const filteredQuotes = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);
  if (filteredQuotes.length === 0) {
    display.innerHTML = "<p>No quotes found for selected category.</p>";
    return;
  }
  const quote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  display.innerHTML = `<p>"${quote.text}" - <em>${quote.category}</em></p>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newQuote = {
    text: textInput.value.trim(),
    category: categoryInput.value.trim()
  };

  if (newQuote.text && newQuote.category) {
    quotes.push(newQuote);
    saveQuotes();
    showRandomQuote();
    textInput.value = "";
    categoryInput.value = "";
    alert("Quote added successfully!");
  } else {
    alert("Please enter both a quote and a category.");
  }
}

function populateCategories() {
  const filter = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];
  const selected = localStorage.getItem("lastCategory") || "all";

  filter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    if (cat === selected) option.selected = true;
    filter.appendChild(option);
  });
}
function fetchQuotesFromServer() {
  fetch("https://jsonplaceholder.typicode.com/posts")
    .then(res => res.json())
    .then(serverQuotes => {
      // process serverQuotes here
    });
}
function postQuoteToServer(quote) {
  fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quote)
  });
}
setInterval(syncQuotes, 60000); // Every 60 seconds
const status = document.getElementById("syncStatus");
status.textContent = "Quotes synced with server!";



function filterQuotes() {
  localStorage.setItem("lastCategory", document.getElementById("categoryFilter").value);
  showRandomQuote();
}

function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    alert('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
}

window.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();
  showRandomQuote();
  
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
  document.getElementById("categoryFilter").addEventListener("change", filterQuotes);
  document.getElementById("exportBtn").addEventListener("click", exportToJson);
});
