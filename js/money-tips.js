const categoryColors = {
  "subscriptions": "#5C6BC0",
  "food": "#FF9800",
  "shopping-smart": "#4CAF50",
  "finance": "#f1bd41",
  "transportation": "#00BCD4",
  "housing-utilities": "#D84315",
  "health-wellness": "#C2185B",
  "entertainment": "#AA00FF"
};

const tipsBank = {
  "subscriptions": [
    "Audit all your subscriptions monthly.",
    "Cancel unused services immediately.",
    "Share family plans with friends or family.",
    "Use free trials wisely—set calendar reminders.",
    "Bundle services for discounts (phone, internet, streaming).",
    "Switch to annual billing—often cheaper than monthly.",
    "Look for discounts and promotions for premium services.",
    "Choose ad-supported free versions when available.",
    "Rotate subscriptions based on your current needs.",
    "Negotiate with providers for better rates.",
    "Use cashback apps and reward points for subscription payments.",
    "Use library resources for free access to premium databases.",
    "Track subscription costs to see the total monthly impact.",
    "Set spending limits on your payment methods for subscriptions.",
    "Opt for basic plans instead of premium tiers.",
    "Use browser extensions to view content if you're tempted to subscribe.",
    "Downgrade plans during months you won't use them heavily.",
    "Cancel free trials before they charge.",
    "Combine similar services under one provider for family discounts.",
    "Review and adjust your subscriptions quarterly."
  ],
  "food": [
    "Meal prep instead of eating out.",
    "Use coupons and look for discounts.",
    "Don’t grocery shop while hungry.",
    "Shop store brands—they’re cheaper.",
    "Cook with family or friends to split costs.",
    "Plan meals around what’s on sale.",
    "Bring snacks from home to avoid convenience store purchases.",
    "Freeze leftovers for easy meals later.",
    "Drink more water—it’s free and healthy.",
    "Avoid delivery fees by picking up your order.",
    "Use apps like Too Good To Go for discounted meals.",
    "Skip lattes—brew your own coffee.",
    "Look for community events with free food.",
    "Try “meatless Mondays” to cut grocery costs.",
    "Make a grocery list and stick to it.",
    "Keep snacks at home to avoid impulse buys.",
    "Avoid pre-cut produce—do it yourself.",
    "Use cashback apps like Ibotta when shopping.",
    "Buy generic brands for pantry staples.",
    "Plan your meals for the week ahead."
  ],
  "shopping-smart": [
    "Wait 24 hours before making non-essential purchases.",
    "Use browser extensions for coupon codes.",
    "Buy in off-seasons for clothes and tech.",
    "Join discount programs and loyalty schemes.",
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
    "Set a shopping wishlist to avoid impulse purchases."
  ],
  "finance": [
    "Track every dollar—use a budgeting app.",
    "Set financial goals and review monthly.",
    "Build an emergency fund—start small.",
    "Avoid credit card debt—pay in full monthly.",
    "Set up auto-transfer to savings every payday.",
    "Check your bank statements for subscriptions to cancel.",
    "Use a checking account with no fees.",
    "Pay off high-interest loans first.",
    "Only borrow what you need.",
    "Understand how interest accrues on your debt.",
    "Avoid payday loans—explore safer alternatives.",
    "Round up purchases to build savings passively.",
    "Open a high-yield savings account.",
    "Learn basic investing early—time is your ally.",
    "File your taxes on time.",
    "Get a part-time job to build experience and income.",
    "Use free financial literacy tools or workshops.",
    "Avoid buying something just because it’s on sale.",
    "Protect your credit score—don’t miss payments.",
    "Review your budget weekly and adjust as needed."
  ],
  "transportation": [
    "Use public transit instead of rideshares.",
    "Look into discounted transit passes.",
    "Walk or bike when possible—it’s free and healthy.",
    "Use carpool apps to share rides and costs.",
    "Avoid peak-time fares on transit systems.",
    "Keep your tires properly inflated for better fuel efficiency.",
    "Don’t speed—it burns more gas.",
    "Bundle errands to cut down on trips.",
    "Download gas price comparison apps.",
    "Use cruise control on highways to save fuel.",
    "Maintain your car—prevent expensive issues later.",
    "Consider car sharing instead of owning.",
    "Look for discounts on travel apps.",
    "Skip parking fees by using free lots or biking.",
    "Split gas with friends for longer trips.",
    "Plan ahead to avoid surge pricing for rideshares.",
    "Avoid idling—turn off your car if you’re waiting.",
    "Use reward programs for gas stations.",
    "Take advantage of shuttle services if available.",
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
    "Consider different housing options if it’s cheaper.",
    "Use smart power strips to reduce phantom energy usage.",
    "Seal air leaks around doors and windows to improve insulation.",
    "Wash clothes in cold water to save energy.",
    "Air dry laundry to save electricity.",
    "Monitor your water usage—shorter showers save money.",
    "Look for housing assistance programs.",
    "Insulate your water heater to save on heating costs.",
    "Choose housing that includes utilities in rent."
  ],
  "health-wellness": [
    "Use community gym facilities when possible.",
    "Take advantage of community health clinics.",
    "Use generic medications—they cost less.",
    "Don’t skip preventative care—it saves long-term.",
    "Learn simple home remedies for common issues.",
    "Stay hydrated—water is free.",
    "Get enough sleep—it reduces costly health issues.",
    "Use free meditation or fitness apps.",
    "Avoid convenience store snacks—bring your own.",
    "Budget for self-care—it’s not a luxury.",
    "Join free fitness groups in your community.",
    "Grow your own herbs or vegetables to save on grocery costs.",
    "Quit smoking/vaping—it’s expensive and unhealthy.",
    "Walk regularly—it’s exercise and saves money.",
    "Shop around for the best prescription drug prices.",
    "Avoid energy drinks—get natural rest instead.",
    "Keep a reusable water bottle on you.",
    "Use health insurance benefits like free annual checkups.",
    "Try stress relief techniques to avoid burnout.",
    "Compare prices at different pharmacies for prescriptions."
  ],
  "entertainment": [
    "Look for discounts on museum and event tickets.",
    "Host movie nights with friends instead of going out.",
    "Stream content instead of paying for cable.",
    "Attend free community events.",
    "Use music streaming services with family plans.",
    "Game during free trials or on free-to-play platforms.",
    "Explore local parks and hikes for free fun.",
    "Use the library for free books and movies.",
    "Share streaming accounts with family.",
    "Look for free concerts or open mic nights.",
    "Try board games or card games at home.",
    "Volunteer at events to get in free.",
    "Look for discounts at theaters and entertainment venues.",
    "Limit impulse purchases at the app store.",
    "Create a home library with borrowed books and magazines.",
    "Explore local community centers for free activities.",
    "Use YouTube for free classes and entertainment.",
    "Plan themed nights with potlucks.",
    "Look for deals on Groupon or local apps.",
    "Follow local social media for free/cheap events."
  ],
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
  updateTips('subscriptions');
  const defaultBtn = document.querySelector('.category-button[data-category="subscriptions"]');
  defaultBtn.classList.add('active');
  defaultBtn.style.color = categoryColors["subscriptions"];
  defaultBtn.querySelectorAll('svg path').forEach(path => {
    path.setAttribute('fill', categoryColors["subscriptions"]);
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