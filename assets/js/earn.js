
let coins = Number(localStorage.getItem('coins')) || 0;
// Функция для обработки подписки на каналы
function subscribeToChannel(channel) {
    // Получаем ссылку на Telegram канал
    const telegramChannelLink = getTelegramChannelLink(channel);
    
    // Проверяем, подписан ли уже пользователь на этот канал
    const subscribedKey = `subscribed_${channel}`;
    const alreadySubscribed = localStorage.getItem(subscribedKey);

    if (!alreadySubscribed) {
        // Если пользователь ещё не подписан, даем бонус и помечаем как подписанного
        coins += 3000;
        localStorage.setItem('coins', coins);
        localStorage.setItem(subscribedKey, true);
        updateBalanceDisplay();
    }

    // Переходим на Telegram канал
    window.open(telegramChannelLink, '_blank');
}

// Вспомогательная функция для получения ссылки на Telegram канал
function getTelegramChannelLink(channel) {
    // Замените ссылки на фактические ссылки ваших Telegram каналов
    switch (channel) {
        case 'channel1':
            return 'https://t.me/FretCoinChannel'; // Замените на фактическую ссылку вашего канала 1
        case 'channel2':
            return 'https://t.me/dhwfsudb'; // Замените на фактическую ссылку вашего канала 2
        default:
            return 'https://t.me/';
    }
}
// Добавляем обработчики событий для кнопок подписки
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('channel1Button').addEventListener('click', function () {
        subscribeToChannel('channel1');
    });

    document.getElementById('channel2Button').addEventListener('click', function () {
        subscribeToChannel('channel2');
    });
});
