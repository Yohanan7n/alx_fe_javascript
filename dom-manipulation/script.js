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
    postQuoteToServer(newQuote); // Post new quote to mock server
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

async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const serverQuotes = await response.json();
    const formattedQuotes = serverQuotes.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));

    // Simple conflict resolution: replace duplicates by text
    const localTexts = quotes.map(q => q.text);
    const newQuotes = formattedQuotes.filter(q => !localTexts.includes(q.text));

    if (newQuotes.length > 0) {
      quotes.push(...newQuotes);
      saveQuotes();
      const status = document.getElementById("syncStatus");
      if (status) status.textContent = "New quotes synced from server.";
    }
  } catch (error) {
    console.error("Failed to fetch from server", error);
  }
}

async function postQuoteToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
  } catch (error) {
    console.error("Failed to post to server", error);
  }
}

function syncQuotes() {
  fetchQuotesFromServer();
}

window.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();
  showRandomQuote();

  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
  document.getElementById("categoryFilter").addEventListener("change", filterQuotes);
  document.getElementById("exportBtn").addEventListener("click", exportToJson);

  // Optional UI status
  const syncStatus = document.createElement("div");
  syncStatus.id = "syncStatus";
  syncStatus.style.marginTop = "10px";
  document.body.appendChild(syncStatus);

  // Periodic sync every 60 seconds
  setInterval(syncQuotes, 60000);
});
