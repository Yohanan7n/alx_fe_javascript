104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
132
133
134
135
136
137
138
139
140
141
142
143
144
145
146
147
148
149
150
151
152
153
154
155
156
157
158
159
160
161
162
let quotes = [];
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
      if (status) status.textContent = "Quotes synced with server!";
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
