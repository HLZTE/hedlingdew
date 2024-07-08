setInterval(() => {
    let count = localStorage.getItem('count') || 0;
    let total = localStorage.getItem('total') || 0;
    let power = localStorage.getItem('power') || 0;

    if (Number(total) > Number(power)) {
        localStorage.setItem('power', `${Number(power) + Number(count)}`);
    }
}, 1000);

document.getElementById('inviteButton').addEventListener('click', function (event) {
    event.preventDefault();

    // Generate a unique referral code if it doesn't exist
    let referralCode = localStorage.getItem('referralCode');
    if (!referralCode) {
        referralCode = generateReferralCode();
        localStorage.setItem('referralCode', referralCode);
    }

    // Form the referral link
    const referralLink = `https://t.me/test2ffdd_bot/dettest?start=${referralCode}`;

    // Show the referral panel
    document.getElementById('referralPanel').style.display = 'block';

    // Set the referral link in the input field
    document.getElementById('referralLink').value = referralLink;
});

document.getElementById('copyButton').addEventListener('click', function () {
    const referralLinkInput = document.getElementById('referralLink');
    referralLinkInput.select();
    referralLinkInput.setSelectionRange(0, 99999); // For mobile devices

    // Copy the text inside the input field
    document.execCommand('copy');

    alert('Referral link copied to clipboard!');
});

document.getElementById('closeButton').addEventListener('click', function () {
    document.getElementById('referralPanel').style.display = 'none';
});

function generateReferralCode() {
    return 'xxxxxx'.replace(/x/g, function () {
        return (Math.random() * 36 | 0).toString(36);
    });
}

// Check for referral code in the URL
const urlParams = new URLSearchParams(window.location.search);
const referralCode = urlParams.get('start');

if (referralCode) {
    // Award bonus to both inviter and invitee
    let count = localStorage.getItem('count') || 0;
    count = Number(count) + 2000;
    localStorage.setItem('count', count);
    
    // Save that this user came from a referral
    localStorage.setItem('referredBy', referralCode);

    alert('You have received a bonus of 2,000 coins for using a referral link!');
}
