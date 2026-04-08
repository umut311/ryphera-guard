const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true, // Sadece bot açıldığında 1 kere çalışır
    execute(client) {
        console.log(`🛡️ [GUARD BOT] Başarıyla Uyandı ve Göreve Hazır: ${client.user.tag}`);
        
        // Botun oynuyor kısmını ayarlıyoruz
        client.user.setActivity('Sunucuyu Koruyor 🛡️', { type: ActivityType.Watching });
    },
};