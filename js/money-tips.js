// Mapping of categories to their corresponding colors.
const categoryColors = {
  "textbook": "#5C6BC0",
  "food-dining": "#FF9800",
  "shopping-smart": "#4CAF50",
  "finance": "#f1bd41",
  "transportation": "#00BCD4",
  "housing-utilities": "#D84315",
  "health-wellness": "#C2185B",
  "entertainment": "#AA00FF"
};

// Bank of money-saving tips per category.
const tipsBank = {
  "textbook": [
    "Buy used textbooks whenever possible.",
    "Rent textbooks instead of purchasing.",
    "Share books with a classmate.",
    "Use the library’s copy for reference.",
    "Check for older editions that are still relevant.",
    "Sell your books back at the end of the semester.",
    "Look for digital versions—they’re often cheaper.",
    "Use open-source or free online materials.",
    "Check Facebook groups or campus boards for book swaps.",
    "Avoid buying books before classes start—you might not need them.",
    "Use price comparison tools like BookFinder.",
    "Download free eBooks from Google Books or Project Gutenberg.",
    "Scan chapters at the library instead of buying the book.",
    "Avoid the campus bookstore—compare online prices first.",
    "Split costs and take turns scanning pages.",
    "Ask professors if the book is truly necessary.",
    "Use PDF versions from educational sources.",
    "Check Reddit or Discord for textbook share groups.",
    "Use apps like Libby to borrow digital books.",
    "Ask older students if they still have books to sell."
  ],
  "food-dining": [
    "Meal prep instead of eating out.",
    "Use coupons and student discounts.",
    "Don’t grocery shop while hungry.",
    "Shop store brands—they’re cheaper.",
    "Cook with roommates to split costs.",
    "Plan meals around what’s on sale.",
    "Bring snacks to campus to avoid vending machines.",
    "Freeze leftovers for easy meals later.",
    "Drink more water—it’s free and healthy.",
    "Avoid delivery fees by picking up your order.",
    "Use apps like Too Good To Go for discounted meals.",
    "Cook in bulk and portion for the week.",
    "Skip lattes—brew your own coffee.",
    "Attend campus events with free food.",
    "Use loyalty apps for freebies and deals.",
    "Try “meatless Mondays” to cut grocery costs.",
    "Make a grocery list and stick to it.",
    "Keep snacks in your bag to avoid impulse buys.",
    "Avoid pre-cut produce—do it yourself.",
    "Use cashback apps like Ibotta when shopping."
  ],
  "shopping-smart": [
    "Wait 24 hours before making non-essential purchases.",
    "Use browser extensions for coupon codes.",
    "Buy in off-seasons for clothes and tech.",
    "Join student discount programs like UNiDAYS & Student App Centre.",
    "Never pay full price—always search for a promo.",
    "Use cashback sites like Rakuten.",
    "Unsubscribe from marketing emails to resist temptation.",
    "Shop thrift stores for clothes and decor.",
    "Compare prices online before buying in-store.",
    "Budget before browsing—set a limit.",
    "Don’t fall for “limited-time” marketing tricks.",
    "Buy quality over quantity—it lasts longer.",
    "Use credit cards with cashback only if you can pay them off.",
    "Delay upgrades—wait until your current device breaks.",
    "Cancel free trials before they charge.",
    "Consider refurbished tech for major savings.",
    "Borrow instead of buying rarely-used items.",
    "Use price tracking tools like CamelCamelCamel.",
    "Wait for major sale events like Black Friday & Cyber Monday.",
    "Ask about student discounts at checkout, even if it’s not advertised."
  ],
  "finance": [
    "Track every dollar—use a budgeting app.",
    "Set financial goals and review monthly.",
    "Build an emergency fund—start small.",
    "Avoid credit card debt—pay in full monthly.",
    "Set up auto-transfer to savings every payday.",
    "Check your bank statements for subscriptions to cancel.",
    "Use a student checking account with no fees.",
    "Pay off high-interest loans first.",
    "Only take out student loans for what you need.",
    "Understand how interest accrues on your debt.",
    "Avoid payday loans—explore safer alternatives.",
    "Round up purchases to build savings passively.",
    "Open a high-yield savings account.",
    "Learn basic investing early—time is your ally.",
    "File your taxes on time—don’t miss student deductions.",
    "Get a part-time job to build experience and income.",
    "Use free financial literacy tools or workshops.",
    "Avoid buying something just because it’s on sale.",
    "Protect your credit score—don’t miss payments.",
    "Review your budget weekly and adjust as needed."
  ],
  "transportation": [
    "Use public transit instead of rideshares.",
    "Look into student transit passes—they’re often discounted.",
    "Walk or bike when possible—it’s free and healthy.",
    "Use carpool apps to share rides and costs.",
    "Avoid peak-time fares on transit systems.",
    "Keep your tires properly inflated for better fuel efficiency.",
    "Don’t speed—it burns more gas.",
    "Bundle errands to cut down on trips.",
    "Download gas price comparison apps.",
    "Use cruise control on highways to save fuel.",
    "Maintain your car—prevent expensive issues later.",
    "Consider car sharing or Zipcar instead of owning.",
    "Use student discounts on travel apps like Greyhound or Amtrak.",
    "Skip parking fees by using free lots or biking.",
    "Split gas with friends for longer trips.",
    "Plan ahead to avoid surge pricing for rideshares.",
    "Avoid idling—turn off your car if you’re waiting.",
    "Use reward programs for gas stations.",
    "Take advantage of campus shuttle services.",
    "Use preloaded transit cards to track and control spending."
  ],
  "housing-utilities": [
    "Split rent and utilities with roommates.",
    "Use LED bulbs—they last longer and cost less.",
    "Unplug devices when not in use.",
    "Keep your thermostat a few degrees lower or higher.",
    "Don’t run half-loads in dishwashers or laundry.",
    "Use natural light during the day.",
    "Run fans instead of AC when possible.",
    "Use weather stripping to keep warm or cool air in.",
    "Report maintenance issues early to avoid big repairs.",
    "Buy secondhand furniture or get it free on local boards.",
    "Avoid housing with unnecessary amenities you won’t use.",
    "Consider off-campus housing if it’s cheaper.",
    "Share streaming accounts and split the bill.",
    "Don’t pay for cable—use streaming or free apps.",
    "Wash clothes in cold water to save energy.",
    "Air dry laundry to save electricity.",
    "Monitor your water usage—shorter showers save money.",
    "Check for student housing subsidies or programs.",
    "Keep windows closed when heating or cooling is on.",
    "Choose housing that includes utilities in rent."
  ],
  "health-wellness": [
    "Use your campus gym—it’s often free.",
    "Take advantage of student health clinics.",
    "Use generic medications—they cost less.",
    "Don’t skip preventative care—it saves long-term.",
    "Learn simple home remedies for common issues.",
    "Stay hydrated—water is free.",
    "Get enough sleep—it reduces costly health issues.",
    "Use free meditation or fitness apps.",
    "Avoid vending machines—bring your own snacks.",
    "Budget for self-care—it’s not a luxury.",
    "Join free fitness groups or campus classes.",
    "Cook nutritious meals instead of buying supplements.",
    "Quit smoking/vaping—it’s expensive and unhealthy.",
    "Walk to class—it’s exercise and saves money.",
    "Check if your school offers mental health resources.",
    "Avoid energy drinks—get natural rest instead.",
    "Keep a reusable water bottle on you.",
    "Use health insurance benefits like free annual checkups.",
    "Try stress relief techniques to avoid burnout.",
    "Compare prices at different pharmacies for prescriptions."
  ],
  "entertainment": [
    "Use your student ID for museum and event discounts.",
    "Host movie nights with friends instead of going out.",
    "Stream content instead of paying for cable.",
    "Attend free campus events.",
    "Use Spotify or Apple Music’s student discount.",
    "Game during free trials or on free-to-play platforms.",
    "Explore local parks and hikes for free fun.",
    "Use the library for free books and movies.",
    "Share streaming accounts with roommates.",
    "Look for free concerts or open mic nights.",
    "Try board games or card games at home.",
    "Volunteer at events to get in free.",
    "Use student discounts at theaters and bowling alleys.",
    "Limit impulse purchases at the app store.",
    "Try creative hobbies like writing, drawing, or DIY crafts.",
    "Attend game nights or club events.",
    "Use YouTube for free classes and entertainment.",
    "Plan themed nights with potlucks.",
    "Look for deals on Groupon or local apps.",
    "Follow local social media for free/cheap events."
  ]
};

// Utility: shuffle an array in place.
const shuffle = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

// Build the HTML for tip cards and duplicate for seamless scrolling.
const generateCardsHTML = (tips) => {
  let cardsHTML = "";
  tips.forEach(tip => {
    cardsHTML += `<div class="tip-card">${tip}</div><div class="tip-card empty"></div>`;
  });
  return cardsHTML + cardsHTML;
};

// Update tip rows with randomized tips for the chosen category.
const updateTips = (category) => {
  const selectedTips = tipsBank[category];
  document.querySelectorAll('.tips-row-inner').forEach(inner => {
    const randomizedTips = shuffle([...selectedTips]);
    inner.innerHTML = generateCardsHTML(randomizedTips);
  });
};

// Event listener for category button clicks.
document.querySelectorAll('.category-button').forEach(button => {
  button.addEventListener('click', () => {
    // Reset all buttons
    document.querySelectorAll('.category-button').forEach(b => {
      b.classList.remove('active');
      b.style.color = "#FFFFFF";
      b.querySelectorAll('svg path').forEach(path => {
        path.setAttribute('fill', '#508de6');
      });
    });
    // Set active state for the clicked button.
    button.classList.add('active');
    const category = button.getAttribute('data-category');
    const selectedColor = categoryColors[category] || "#4e80ee";
    button.style.color = selectedColor;
    button.querySelectorAll('svg path').forEach(path => {
      path.setAttribute('fill', selectedColor);
    });
    // Update arrow-line color.
    const arrowLine = document.querySelector('.arrow-line');
    arrowLine.style.backgroundColor = selectedColor;
    let styleEl = document.getElementById('arrow-after-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'arrow-after-style';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
      .arrow-line::after {
        border-left: 10px solid ${selectedColor};
      }
    `;
    updateTips(category);
  });
});

// Initialize default category on page load.
window.addEventListener('DOMContentLoaded', () => {
  updateTips('textbook');
  const defaultBtn = document.querySelector('.category-button[data-category="textbook"]');
  defaultBtn.classList.add('active');
  defaultBtn.style.color = categoryColors["textbook"];
  defaultBtn.querySelectorAll('svg path').forEach(path => {
    path.setAttribute('fill', categoryColors["textbook"]);
  });
});

window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('.tips-row').forEach(row => {
      row.classList.add('scroll-animate');
    });
    // restart tips to ensure animations apply
    const activeCategory = document.querySelector('.category-button.active').getAttribute('data-category');
    updateTips(activeCategory);
  }, 50);
});