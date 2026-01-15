// ==========================================
// 1. НАСТРОЙКИ (ЗАМЕНИТЕ НА СВОИ)
// ==========================================
const BOT_TOKEN = '8510654671:AAGgL6_C193WcVMN1DyZXdND2U3LHtWfd3A'; 
const ADMIN_CHAT_ID = '8485387955';
const MANAGER_USER = 'whitebles'; // Ник менеджера в TG без @

// ==========================================
// 2. ДАННЫЕ ТОВАРОВ
// ==========================================
const products = [
    { id: 1, category: "Масла", name: "G-Energy Super Start 5W-30", price: 4250, img: "https://shop.gazpromneft-oil.ru/upload/iblock/c38/c3866170d195e28236173059287a992a.png" },
    { id: 2, category: "Масла", name: "Premium N 5W-40", price: 3800, img: "https://shop.gazpromneft-oil.ru/upload/iblock/510/5105e60802c6114e9185a53826040685.png" },
    { id: 3, category: "Смазки", name: "Grease L EP 2", price: 950, img: "https://shop.gazpromneft-oil.ru/upload/iblock/d4b/d4b14d35f41097240f906f3684a8966c.png" },
    { id: 4, category: "Техника", name: "G-Profi MSI 10W-40 20л", price: 13200, img: "https://shop.gazpromneft-oil.ru/upload/iblock/035/0358e0a3904a08153098380482555547.png" },
    { id: 5, category: "Трансмиссия", name: "G-Box Expert 75W-90", price: 2100, img: "https://shop.gazpromneft-oil.ru/upload/iblock/d03/d03d36b8568903e1e2d480e6c6411520.png" }
];

let cart = {};

// ==========================================
// 3. ОТРИСОВКА КАТАЛОГА
// ==========================================
function render() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    grid.innerHTML = products.map(p => `
        <div class="product-card p-4 rounded-3xl flex flex-col">
            <div class="h-32 mb-4 flex items-center justify-center">
                <img src="${p.img}" class="max-h-full object-contain pointer-events-none">
            </div>
            <div class="text-[10px] text-blue-400 font-bold uppercase mb-1 tracking-widest">${p.category}</div>
            <h3 class="font-bold text-sm mb-3 h-10 line-clamp-2">${p.name}</h3>
            <div class="flex justify-between items-center mt-auto">
                <span class="font-black text-white">${p.price.toLocaleString()} ₽</span>
                <button onclick="addToCart(${p.id})" class="bg-[#0070ba] hover:bg-white hover:text-[#0070ba] w-8 h-8 rounded-lg flex items-center justify-center transition-colors">
                    <i class="fas fa-plus text-xs"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// ==========================================
// 4. ФУНКЦИИ КОРЗИНЫ
// ==========================================
function addToCart(id) {
    if (!cart[id]) {
        cart[id] = { ...products.find(x => x.id === id), qty: 1 };
    } else {
        cart[id].qty++;
    }
    updateUI();
}

function changeQty(id, delta) {
    cart[id].qty += delta;
    if (cart[id].qty <= 0) delete cart[id];
    updateUI();
}

function updateUI() {
    const itemsDiv = document.getElementById('cart-items');
    let total = 0, count = 0;
    itemsDiv.innerHTML = '';

    for (let id in cart) {
        const item = cart[id];
        total += item.price * item.qty;
        count += item.qty;
        itemsDiv.innerHTML += `
            <div class="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                <img src="${item.img}" class="w-10 h-10 object-contain">
                <div class="flex-grow text-[11px] font-bold leading-tight">${item.name}</div>
                <div class="flex items-center gap-2 bg-black/30 p-1 px-2 rounded-lg">
                    <button onclick="changeQty(${id},-1)" class="hover:text-red-400"><i class="fas fa-minus text-[10px]"></i></button>
                    <span class="text-xs font-bold">${item.qty}</span>
                    <button onclick="changeQty(${id},1)" class="text-[#0070ba] hover:text-white"><i class="fas fa-plus text-[10px]"></i></button>
                </div>
            </div>`;
    }
    document.getElementById('cart-count').innerText = count;
    document.getElementById('total-price').innerText = total.toLocaleString() + ' ₽';
    if(count === 0) itemsDiv.innerHTML = '<div class="text-center py-20 text-slate-500 text-xs font-bold uppercase tracking-widest">Корзина пуста</div>';
}

function toggleCart() {
    const m = document.getElementById('cart-modal');
    m.classList.toggle('hidden');
    m.style.display = m.classList.contains('hidden') ? 'none' : 'flex';
}

// ==========================================
// 5. ОФОРМЛЕНИЕ ЗАКАЗА
// ==========================================
function openCheckout() {
    if (Object.keys(cart).length === 0) return alert("Ваша корзина пуста!");
    document.getElementById('checkout-modal').classList.remove('hidden');
    document.getElementById('checkout-modal').classList.add('flex');
}

function closeCheckout() {
    document.getElementById('checkout-modal').classList.add('hidden');
}

async function confirmOrder() {
    const name = document.getElementById('client-name').value.trim();
    const phone = document.getElementById('client-phone').value.trim();

    if (!name || !phone) return alert("Пожалуйста, заполните имя и телефон!");

    const btn = document.getElementById('final-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> ОБРАБОТКА...';

    // Показываем синий экран анимации
    const overlay = document.createElement('div');
    overlay.className = "fixed inset-0 bg-[#0070ba] z-[1000] flex items-center justify-center overlay-fade";
    overlay.innerHTML = '<div class="text-white text-center"><i class="fas fa-paper-plane text-6xl mb-4 animate-bounce"></i><br><b class="text-xl uppercase italic">Заказ отправляется...</b></div>';
    document.body.appendChild(overlay);

    // Собираем список товаров для сообщения
    let total = document.getElementById('total-price').innerText;
    let list = "";
    for (let id in cart) {
        list += `• ${cart[id].name} (${cart[id].qty} шт.)\n`;
    }

    const orderMsg = `📦 <b>НОВЫЙ ЗАКАЗ</b>\n\n👤 <b>Клиент:</b> ${name}\n📞 <b>Тел:</b> ${phone}\n\n📝 <b>Товары:</b>\n${list}\n💰 <b>Итого: ${total}</b>`;

    try {
        // 1. Отправляем скрытое уведомление менеджеру
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: ADMIN_CHAT_ID,
                text: orderMsg,
                parse_mode: 'HTML',
                reply_markup: { 
                    inline_keyboard: [[{ text: "🚀 Принять в работу", callback_data: "work" }]] 
                }
            })
        });

        // 2. Через 1.5 секунды перенаправляем клиента в диалог
        setTimeout(() => {
            window.location.href = `https://t.me/${MANAGER_USER}?text=${encodeURIComponent("Привет! Мой заказ:\n" + list + "Сумма: " + total)}`;
        }, 1500);

    } catch (e) {
        alert("Произошла ошибка при отправке. Попробуйте еще раз.");
        overlay.remove();
        btn.disabled = false;
        btn.innerText = "ПОДТВЕРДИТЬ ЗАКАЗ";
    }
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', render);
