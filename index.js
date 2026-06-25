const weatherform = document.querySelector(".weatherForm");
const cityInput = document.querySelector(".cityInput");
const suggestionsList = document.querySelector(".suggestionsList");
const card = document.querySelector(".card");
const chatToggle = document.getElementById("chatToggle");
const chatPanel = document.getElementById("chatPanel");
const chatPanelInner = document.querySelector(".chatPanelInner");
const chatClose = document.getElementById("chatClose");
const chatBody = document.getElementById("chatBody");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");
const chatMic = document.getElementById("chatMic");
const chatSpeak = document.getElementById("chatSpeak");
const chatSpeakOff = document.getElementById("chatSpeakOff");
const chatStatus = document.getElementById("chatStatus");
const apiBase = window.location.protocol.startsWith('http') ? '' : 'http://127.0.0.1:5000';
const apikey = "e38f25aa2bd8bd0da019698863c3969f";
const citystateapikey = "9e9dd63bc1bcc7d8ca338c744970b9a4ca1168561828260ec1a800317f20852f";

let selectedSuggestionIndex = -1;
let lastSpeechText = "";
let lastAssistantText = "";
let suggestionTimeout;
let lastInputValue = "";
let timezoneIntervalId = null;

const citiesDatabase = [ 
    "London", "Paris", "Tokyo", "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
    "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville",
    "Fort Worth", "Columbus", "San Francisco", "Charlotte", "Indianapolis", "Seattle", "Denver",
    "Washington", "Boston", "Nashville", "El Paso", "Detroit", "Memphis", "Portland", "Oklahoma City",
    "Las Vegas", "Louisville", "Baltimore", "Milwaukee", "Albuquerque", "Tucson", "Fresno", "Sacramento",
    "Kansas City", "Atlanta", "Miami", "Madrid", "Rome", "Berlin", "Amsterdam", "Vienna", "Prague",
    "Warsaw", "Athens", "Dublin", "Lisbon", "Barcelona", "Milan", "Geneva", "Zurich", "Stockholm",
    "Copenhagen", "Helsinki", "Osaka", "Kyoto", "Nagoya", "Hiroshima", "Sapporo", "Yokohama",
    "Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Hangzhou", "Wuhan", "Chongqing",
    "Tianjin", "Nanjing", "Xi'an", "Hong Kong", "Seoul", "Busan", "Incheon", "Daegu", "Daejeon",
    "Ulsan", "Taipei", "Kaohsiung", "Manila", "Cebu", "Davao", "Quezon City", "Hanoi", "Ho Chi Minh City",
    "Da Nang", "Phnom Penh", "Vientiane", "Yangon", "Kuala Lumpur", "Penang", "Johor Bahru", "Singapore",
    "Bangkok", "Phuket", "Pattaya", "Jakarta", "Surabaya", "Bandung", "Medan", "Denpasar", "Brisbane",
    "Sydney", "Melbourne", "Perth", "Adelaide", "Gold Coast", "Canberra", "Auckland", "Wellington",
    "Christchurch", "Suva", "Port Moresby", "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad",
    "Chennai", "Kolkata", "Pune", "Jaipur", "Lucknow", "Surat", "Nagpur", "Indore", "Thane", "Bhopal",
    "Agra", "Patna", "Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Kazan", "Nizhny Novgorod",
    "Samara", "Omsk", "Chelyabinsk", "Rostov-on-Don", "Istanbul", "Ankara", "Izmir", "Bursa", "Antalya",
    "Adana", "Gaziantep", "Konya", "Mersin", "Kayseri", "Cairo", "Alexandria", "Giza", "Luxor", "Hurghada",
    "Casablanca", "Marrakech", "Rabat", "Tangier", "Fes", "Toronto", "Vancouver", "Mexico City", "São Paulo",
    "Rio de Janeiro", "Buenos Aires", "Sao Paulo", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte",
    "Manaus", "Caracas", "Bogotá", "Lima", "Quito", "Santiago", "Valparaíso", "Concepción", "Auckland",
    "Lagos", "Johannesburg", "Cape Town", "Pretoria", "Durban", "Port Elizabeth", "Bloemfontein", "Windhoek",
    "Nairobi", "Dar es Salaam", "Kampala", "Kigali", "Khartoum", "Addis Ababa", "Abuja", "Port Harcourt", 
    "Accra", "Dakar" , "Chakan", "Kumasi", "Tamale", "Maiduguri", "Zaria", "Ibadan", "Benin City", "Enugu", "Abeokuta", 
    "Ilorin", "Ogbomosho", "Sokoto", "Onitsha", "Warri", "Calabar", "Uyo", "Makurdi", "Jalingo", "Yola", "Gombe", "Bauchi",
     "Jigawa", "Kano", "Katsina", "Zamfara", "Yobe", "Borno", "Adamawa", "Taraba", "Niger", "Kebbi", "Sokoto", "FCT Abuja",
     "Lagos", "Kano", "Ibadan", "Benin City", "Enugu", "Abeokuta", "Ilorin", "Ogbomosho", "Sokoto", "Onitsha", "Warri",
     "Calabar", "Uyo", "Makurdi", "Jalingo", "Yola", "Gombe", "Bauchi", "Jigawa", "Kano", "Katsina", "Zamfara", "Yobe",
     "Borno", "Adamawa", "Taraba", "Niger", "Kebbi", "Khagaria", "Munger", "Begusarai", "Muzaffarpur", "Samastipur", "Araria", "Purnia", "Katihar", "Supaul", "Madhepura",
    "Darbhanga", "Sitamarhi", "Sheohar", "Madhubani", "Saharsa", "Kishanganj", "Pashchim Champaran",
     "Purba Champaran", "Vaishali", "Gaya", "Nawada", "Aurangabad", "Rohtas", "Bhojpur", "Buxar",
    "Kaimur", "Arwal", "Jehanabad", "Lakhisarai", "Munger", "Begusarai"
];

function normalizeQuery(query) {
    return query
        .replace(/[^a-zA-Z\s,]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function normalizeForCompare(text) {
    return text.toLowerCase().replace(/[^a-z]/g, "").trim();
}

function isValidCityName(name) {
    return /^[a-zA-ZÀ-ÿ\s'\-]{3,}$/.test(name.trim());
}

function getLocalSuggestions(query) {
    const normalizedQuery = normalizeQuery(query).toLowerCase();
    if (!normalizedQuery) {
        return [];
    }

    const startsWithMatches = citiesDatabase
        .filter(city => city.toLowerCase().startsWith(normalizedQuery))
        .map(name => ({ name }));

    if (startsWithMatches.length > 0) {
        return startsWithMatches;
    }

    if (normalizedQuery.length >= 3) {
        const containsMatches = citiesDatabase
            .filter(city => city.toLowerCase().includes(normalizedQuery))
            .map(name => ({ name }));

        if (containsMatches.length > 0) {
            return containsMatches;
        }
    }

    const tokens = normalizedQuery.split(" ").filter(token => token.length > 2);
    if (tokens.length > 0) {
        const tokenMatches = citiesDatabase.filter(city => {
            const cityComp = normalizeForCompare(city);
            return tokens.every(token => cityComp.includes(normalizeForCompare(token)));
        }).map(name => ({ name }));

        return tokenMatches;
    }

    return [];
}

async function fetchAPIResults(query, currentResultsSet) {
    const normalizedQuery = normalizeQuery(query);
    if (!normalizedQuery || normalizedQuery.length < 1) {
        return [];
    }

    const tokens = normalizedQuery.split(" ").filter(Boolean);
    const tryQueries = [normalizedQuery];

    if (tokens.length > 1) {
        const longestToken = tokens.reduce((a, b) => (a.length >= b.length ? a : b));
        if (!tryQueries.includes(longestToken)) {
            tryQueries.push(longestToken);
        }

        const filteredTokens = tokens.filter(token => token.length > 2);
        const filteredQuery = filteredTokens.join(" ");
        if (filteredQuery && !tryQueries.includes(filteredQuery)) {
            tryQueries.push(filteredQuery);
        }
    }

    for (const q of tryQueries) {
        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=50&appid=${apikey}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                continue;
            }

            const results = await response.json();
            if (!Array.isArray(results) || results.length === 0) {
                continue;
            }

            const apiResults = [];
            results.forEach(location => {
                const cityName = location.name;
                const cityLower = cityName.toLowerCase();
                const normalizedCity = normalizeQuery(cityName).toLowerCase();
                const queryTokens = normalizedQuery.split(" ").filter(token => token.length > 2);

                if (!isValidCityName(cityName)) {
                    return;
                }

                if (queryTokens.length > 0) {
                    const matchesToken = queryTokens.some(token => normalizeForCompare(cityName).includes(normalizeForCompare(token)));
                    if (!matchesToken) {
                        return;
                    }
                }

                if (!currentResultsSet.has(cityLower) && normalizedCity.length >= 3) {
                    currentResultsSet.add(cityLower);
                    apiResults.push({ name: cityName });
                }
            });

            if (apiResults.length > 0) {
                console.log("Got geocoding API results for:", q, apiResults.length);
                if (suggestionsList.children.length === 0) {
                    displaySuggestions(apiResults);
                } else {
                    appendSuggestions(apiResults);
                }
                suggestionsList.classList.add("active");
                return apiResults;
            }
        } catch (error) {
            console.log("API fetch error for", q, error.message);
        }
    }

    return [];
}

// Event listener for input typing
cityInput.addEventListener("input", async (event) => {
    const rawInput = event.target.value;
    const inputValue = normalizeQuery(rawInput);
    const isDeletion = rawInput.length < lastInputValue.length;
    selectedSuggestionIndex = -1;

    if (suggestionTimeout) {
        clearTimeout(suggestionTimeout);
    }

    if (inputValue.length === 0 || isDeletion) {
        suggestionsList.innerHTML = "";
        suggestionsList.classList.remove("active");
        lastInputValue = rawInput;
        return;
    }

    const localSuggestions = getLocalSuggestions(inputValue);
    if (localSuggestions.length > 0) {
        displaySuggestions(localSuggestions);
        suggestionsList.classList.add("active");
    } else {
        suggestionsList.innerHTML = "";
        suggestionsList.classList.remove("active");
    }

    const resultSet = new Set(localSuggestions.map(item => item.name.toLowerCase()));
    await fetchAPIResults(inputValue, resultSet);
});

// Keyboard navigation
cityInput.addEventListener("keydown", (event) => {
    const items = suggestionsList.querySelectorAll("li");
    
    if (event.key === "ArrowDown") {
        event.preventDefault();
        selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, items.length - 1);
        updateSelectedSuggestion(items);
    } 
    else if (event.key === "ArrowUp") {
        event.preventDefault();
        selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
        updateSelectedSuggestion(items);
    }
    else if (event.key === "Enter") {
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < items.length) {
            event.preventDefault();
            const selectedCity = items[selectedSuggestionIndex].dataset.city;
            cityInput.value = selectedCity;
            suggestionsList.classList.remove("active");
            weatherform.dispatchEvent(new Event("submit"));
        }
    }
    else if (event.key === "Escape") {
        suggestionsList.classList.remove("active");
    }
});

function displaySuggestions(cities) {
    suggestionsList.innerHTML = "";
    
    cities.forEach((city) => {
        const li = document.createElement("li");
        li.dataset.city = city.name;
        li.textContent = city.name;
        
        li.addEventListener("click", () => {
            cityInput.value = city.name;
            suggestionsList.classList.remove("active");
            weatherform.dispatchEvent(new Event("submit"));
        });
        
        suggestionsList.appendChild(li);
    });
}

function appendSuggestions(cities) {
    cities.forEach((city) => {
        const exists = Array.from(suggestionsList.children).some(
            li => li.dataset.city.toLowerCase() === city.name.toLowerCase()
        );
        if (exists) {
            return;
        }

        const li = document.createElement("li");
        li.dataset.city = city.name;
        li.textContent = city.name;

        li.addEventListener("click", () => {
            cityInput.value = city.name;
            suggestionsList.classList.remove("active");
            weatherform.dispatchEvent(new Event("submit"));
        });

        suggestionsList.appendChild(li);
    });
}

function updateSelectedSuggestion(items) {
    items.forEach((item, index) => {
        if (index === selectedSuggestionIndex) {
            item.classList.add("selected");
            item.scrollIntoView({ block: "nearest" });
        } else {
            item.classList.remove("selected");
        }
    });
}

// Close suggestions when clicking outside
document.addEventListener("click", (event) => {
    if (!event.target.closest(".inputWrapper")) {
        suggestionsList.classList.remove("active");
    }
});

weatherform.addEventListener("submit", async event => {

    event.preventDefault();

    const city = cityInput.value.trim();

    if (city) {
        try {
          const weatherData = await getWeather(city);
          displayWeatherInfo(weatherData);
        } 
        catch (error) {
            console.error(error);
            displayError(error);
        }
    } 
    else{
        displayError("Please enter a city name.");
    }
});

async function getWeather(city) {

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apikey}`;
    console.log("Fetching from:", apiUrl);
    
    const response = await fetch(apiUrl);
    console.log("Response status:", response.status);
    
    if (!response.ok) {
        throw new Error("City not found. Please check the city name and try again.");
    }
    
    const data = await response.json();
    console.log("Data received:", data);
    return data;

}
 
function displayWeatherInfo(data) {

    const { name: city,
           main: { temp, humidity },                
           weather: [{ description, id }] } = data;

   card.textContent = "";
   card.style.display = "flex";
   card.style.flexDirection = "column";
   card.style.alignItems = "center";
   
   const cityDispaly = document.createElement("h1");
   const countryDisplay = document.createElement("h2");
   const dateDisplay = document.createElement("p");
   const timeDisplay = document.createElement("p");
   const tempDispaly = document.createElement("p");
   const feelslike = document.createElement("p");
   const humidityDispaly = document.createElement("p");
   const descDispaly = document.createElement("p");
   const weatherIcon = document.createElement("img");
   const windDispaly = document.createElement("p");
   const sunriseDispaly = document.createElement("p");
   const sunsetDispaly = document.createElement("p");
   

    cityDispaly.textContent = city;
    countryDisplay.textContent = data.sys.country;
    updateTimeDisplay(timeDisplay, dateDisplay, data.timezone);
    tempDispaly.textContent = `${(temp - 273.15).toFixed(1)}°C`;
    feelslike.textContent = `Feels like: ${(data.main.feels_like - 273.15).toFixed(1)}°C`;
    humidityDispaly.textContent = `Humidity: ${humidity}%`;
    descDispaly.textContent = description.replace(/\b\w/g, char => char.toUpperCase());
    weatherIcon.src = getWeatherIconPath(id);
    weatherIcon.alt = description;
    weatherIcon.classList.add("weatherIcon");
    windDispaly.textContent = `Wind Speed: ${data.wind.speed} m/s`;
    sunriseDispaly.textContent = `Sunrise: ${formatLocalTimestamp(data.sys.sunrise, data.timezone)}`;
    sunsetDispaly.textContent = `Sunset: ${formatLocalTimestamp(data.sys.sunset, data.timezone)}`;
    


    cityDispaly.classList.add("cityDisplay");
    countryDisplay.classList.add("countryDisplay");
    dateDisplay.classList.add("dateDisplay");
    timeDisplay.classList.add("timeDisplay");
    tempDispaly.classList.add("tempDisplay");
    feelslike.classList.add("feelslike");
    humidityDispaly.classList.add("humidityDisplay");
    descDispaly.classList.add("descDisplay");
    weatherIcon.classList.add("weatherIcon");
    windDispaly.classList.add("windDisplay");
    sunriseDispaly.classList.add("sunriseDisplay");
    sunsetDispaly.classList.add("sunsetDisplay");
    

    card.appendChild(cityDispaly);
    card.appendChild(countryDisplay);
    card.appendChild(dateDisplay);
    card.appendChild(timeDisplay);
    card.appendChild(tempDispaly);
    card.appendChild(feelslike);
    card.appendChild(humidityDispaly);
    card.appendChild(descDispaly);
    card.appendChild(weatherIcon);
    card.appendChild(windDispaly);
    card.appendChild(sunriseDispaly);
    card.appendChild(sunsetDispaly);

    lastSpeechText = `Weather in ${city}, ${data.sys.country}. ${descDispaly.textContent}. Temperature ${tempDispaly.textContent}, feels like ${feelslike.textContent}. Humidity ${humidity}% , wind ${data.wind.speed} meters per second. Sunrise at ${formatLocalTimestamp(data.sys.sunrise, data.timezone)} and sunset at ${formatLocalTimestamp(data.sys.sunset, data.timezone)}.`;
    
    if (timezoneIntervalId) {
        clearInterval(timezoneIntervalId);
    }
    timezoneIntervalId = setInterval(() => updateTimeDisplay(timeDisplay, dateDisplay, data.timezone), 1000);
    
}

function getWeatherIconPath(weatherID) {
   
    switch (true) {
        case (weatherID >= 200 && weatherID < 300):
           return "rain.png"; // Thunderstorm
        case (weatherID >= 300 && weatherID < 400):
            return "rain.png"; // Drizzle
        case (weatherID >= 500 && weatherID < 600):
            return "rain.png"; // Rain
        case (weatherID >= 600 && weatherID < 700):
             return "snow.png"; // Snow
        case (weatherID >= 700 && weatherID < 800):
            return "mist.png"; // Fog / Mist
        case (weatherID === 800):
            return "clear.png"; // Clear
        case (weatherID >= 801 && weatherID < 900):
            return "cloud.png"; // Clouds
        default:
            return "cloud.png"; // Unknown

    }
}




function updateTimeDisplay(timeDisplay, dateDisplay, timezoneOffsetSeconds) {
    const localDateTime = getLocalDateTimeStrings(timezoneOffsetSeconds);
    timeDisplay.textContent = localDateTime.time;
    if (dateDisplay) {
        dateDisplay.textContent = localDateTime.date;
    }
}

function getLocalDateTimeStrings(timezoneOffsetSeconds) {
    const localMs = Date.now() + timezoneOffsetSeconds * 1000;
    const localDate = new Date(localMs);
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const weekday = weekdays[localDate.getUTCDay()];
    const day = String(localDate.getUTCDate()).padStart(2, '0');
    const monthName = months[localDate.getUTCMonth()];
    const year = localDate.getUTCFullYear();
    const rawHours = localDate.getUTCHours();
    const hours = String((rawHours % 12) || 12).padStart(2, '0');
    const minutes = String(localDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(localDate.getUTCSeconds()).padStart(2, '0');
    const period = rawHours >= 12 ? 'PM' : 'AM';
    return {
        date: `${weekday}, ${monthName} ${day}, ${year}`,
        time: `${hours}:${minutes}:${seconds} ${period}`
    };
}

function formatLocalTimestamp(unixSeconds, timezoneOffsetSeconds) {
    const localMs = (unixSeconds + timezoneOffsetSeconds) * 1000;
    const localDate = new Date(localMs);
    const rawHours = localDate.getUTCHours();
    const hours = String((rawHours % 12) || 12).padStart(2, '0');
    const minutes = String(localDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(localDate.getUTCSeconds()).padStart(2, '0');
    const period = rawHours >= 12 ? 'PM' : 'AM';
    return `${hours}:${minutes}:${seconds} ${period}`;
}

function displayError(message){
    if (message instanceof Error) {
        message = message.message;
    }
    message = String(message);

    card.textContent = "";
    card.style.display = "flex";

    const errorDisplay = document.createElement("p");
    errorDisplay.textContent = message;
    errorDisplay.classList.add("errorDisplay");

    if (message.toLowerCase().includes("city not found")) {
        const errorImage = document.createElement("img");
        errorImage.src = "404.png";
        errorImage.alt = "City not found";
        errorImage.classList.add("errorImage");
        card.appendChild(errorImage);
    }

    card.appendChild(errorDisplay);
}

function appendChatMessage(role, text) {
    const messageBox = document.createElement("div");
    messageBox.className = `chatMessage ${role === 'user' ? 'user' : 'assistant'}`;
    messageBox.innerHTML = `<strong>${role === 'user' ? 'You' : 'Assistant'}:</strong><br>${text.replace(/\n/g, '<br>')}`;
    chatMessages.appendChild(messageBox);
    
    // Scroll to bottom with smooth behavior
    setTimeout(() => {
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 100);
}

function setChatStatus(text) {
    chatStatus.textContent = text;
}

async function sendChatMessage() {
    const prompt = chatInput.value.trim();
    if (!prompt) {
        return;
    }

    appendChatMessage('user', prompt);
    chatInput.value = '';
    chatInput.disabled = true;
    chatSend.disabled = true;
    setChatStatus('Waiting for response...');

    try {
        const response = await fetch(`${apiBase}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: prompt })
        });

        const responseText = await response.text();
        let payload;
        try {
            payload = JSON.parse(responseText);
        } catch {
            throw new Error('Chat service returned invalid data. Is the backend deployed?');
        }

        if (!response.ok) {
            throw new Error(payload.error || `Unable to reach chat service (${response.status}).`);
        }

        if (payload.reply) {
            appendChatMessage('assistant', payload.reply);
            lastAssistantText = payload.reply;
            setChatStatus('Response delivered.');
        } else {
            throw new Error(payload.error || 'Received an invalid chat response.');
        }
    } catch (error) {
        appendChatMessage('assistant', `Error: ${error.message}`);
        setChatStatus('Chat failed. Please try again.');
    } finally {
        chatInput.disabled = false;
        chatSend.disabled = false;
        chatMic.disabled = false;
        chatInput.focus();
    }
}

async function listenWithMicrophone() {
    chatMic.disabled = true;
    setChatStatus('Listening... please speak.');
    try {
        const response = await fetch(`${apiBase}/api/listen`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ timeout: 8.0, phrase_time_limit: 8.0 })
        });

        const responseText = await response.text();
        let payload;
        try {
            payload = JSON.parse(responseText);
        } catch {
            throw new Error('Microphone service returned invalid data. Is the backend deployed?');
        }

        if (!response.ok) {
            throw new Error(payload.error || `Microphone request failed (${response.status}).`);
        }

        const text = payload.text || '';
        const lang = payload.lang || 'unknown';
        if (text) {
            const current = chatInput.value.trim();
            chatInput.value = current ? `${current} ${text}` : text;
            setChatStatus(`Recognized language: ${lang}`);
            chatInput.focus();
        } else {
            setChatStatus('No speech detected. Please try again.');
        }
    } catch (error) {
        setChatStatus(`Voice error: ${error.message}`);
    } finally {
        chatMic.disabled = false;
    }
}

function speakChatResponse() {
    if (!lastAssistantText) {
        setChatStatus('Get a response from the assistant first, then click speak.');
        return;
    }

    if (!('speechSynthesis' in window)) {
        setChatStatus('Speech synthesis is not supported in this browser.');
        return;
    }

    const utterance = new SpeechSynthesisUtterance(lastAssistantText);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
    setChatStatus('Speaking assistant response...');
}

function stopChatSpeech() {
    if (!('speechSynthesis' in window)) {
        setChatStatus('Speech synthesis is not supported in this browser.');
        return;
    }
    
    window.speechSynthesis.cancel();
    setChatStatus('Speech stopped.');
}

function openChatPanel() {
    chatPanel.classList.remove('hidden');
    chatPanel.setAttribute('aria-hidden', 'false');
    chatToggle.style.display = 'none';
    chatInput.focus();
}

function closeChatPanel() {
    chatPanel.classList.add('hidden');
    chatPanel.setAttribute('aria-hidden', 'true');
    chatToggle.style.display = '';
}

chatToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    openChatPanel();
});

chatClose.addEventListener('click', (event) => {
    event.stopPropagation();
    closeChatPanel();
});

chatSend.addEventListener('click', (event) => {
    event.stopPropagation();
    sendChatMessage();
});

chatMic.addEventListener('click', (event) => {
    event.stopPropagation();
    listenWithMicrophone();
});

chatSpeak.addEventListener('click', (event) => {
    event.stopPropagation();
    speakChatResponse();
});

chatSpeakOff.addEventListener('click', (event) => {
    event.stopPropagation();
    stopChatSpeech();
});

chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChatMessage();
    }
});
