// 1. КОНФИГУРАЦИЯ
const BOT_TOKEN = '8510654671:AAGgL6_C193WcVMN1DyZXdND2U3LHtWfd3A'; 
const ADMIN_CHAT_ID = '8485387955';
const MANAGER_USERNAME = 'whitebles'; // твой ник для прямой связи

// 2. ДАННЫЕ ТОВАРОВ (с реальными фото)
const products = [
    { id: 1, category: "Моторные масла", name: "G-Energy Super Start 5W-30", price: 4250, shortDesc: "Синтетика для двигателей с DPF.", fullDesc: "Премиальное синтетическое масло для современных бензиновых и дизельных двигателей. Оптимизировано для систем очистки выхлопных газов.", specs: { "Вязкость": "5W-30", "ACEA": "C3", "API": "SN/CF" }, img: "https://shop.gazpromneft-oil.ru/upload/iblock/c38/c3866170d195e28236173059287a992a.png" },
    { id: 2, category: "Моторные масла", name: "Gazpromneft Premium N 5W-40", price: 3800, shortDesc: "Универсальная синтетика.", fullDesc: "Обеспечивает надежную защиту двигателя в различных режимах эксплуатации.", specs: { "Вязкость": "5W-40", "API": "SN/CF" }, img: "https://shop.gazpromneft-oil.ru/upload/iblock/510/5105e60802c6114e9185a53826040685.png" },
    { id: 3, category: "Смазки", name: "Grease L EP 2 (400г)", price: 950, shortDesc: "Многоцелевая литиевая смазка.", fullDesc: "Для узлов трения промышленного оборудования и транспорта.", specs: { "NLGI": "2", "Температура": "-30..+120°C" }, img: "https://shop.gazpromneft-oil.ru/upload/iblock/d4b/d4b14d35f41097240f906f3684a8966c.png" },
    { id: 4, category: "Тяжелая техника", name: "G-Profi MSI 10W-40 (20л)", price: 13200, shortDesc: "Для дизелей SHPD.", fullDesc: "Разработано для высоконагруженных двигателей Евро-4/5.", specs: { "Объем": "20л", "Класс": "CI-4/SL" }, img: "https://shop.gazpromneft-oil.ru/upload/iblock/035/0358e0a3904a08153098380482555547.png" },
    { id: 5, category: "Трансмиссия", name: "G-Box Expert 75W-90", price: 2100, shortDesc: "Для МКПП и мостов.", fullDesc: "Обеспечивает плавное переключение передач и защиту узлов.", specs: { "Класс": "GL-4", "Тип": "Полусинтетика" }, img: "https://shop.gazpromneft-oil.ru/upload/iblock/d03/d03d36b8568903e1e2d480e6c6411520.png" },
    { id: 6, category: "Антифризы", name: "Antifreeze BS 40 (5кг)", price: 1650, shortDesc: "Готовый синий антифриз.", fullDesc: "Эффективная защита от коррозии и кавитации до -40°C.", specs: { "Цвет": "Синий", "Срок": "2 года" }, img: "https://shop.gazpromneft-oil.ru/upload/iblock/a87/a8790117a42f61e7a505b2a09c25b340.png" }
];

let cart = JSON.parse(localStorage.getItem('gp_premium_v9')) || {};

// 3. ОТРИСОВКА КАТАЛОГА
function renderProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    grid.innerHTML = products.map(p => {
        const inCart = cart[p.id] ? cart[p.id].qty : 0;
        return `
        <div class="product-card p-4 rounded-[1.5rem] flex flex-col relative cursor-pointer" onclick="openProductModal(${p.id})">
            ${inCart > 0 ? `<div class="absolute top-3 left-3 bg-[#0070ba] text-white px-2 py-0.5 rounded-lg text-[10px] font-bold z-10 shadow-lg border border-white/20">В КОРЗИНЕ: ${inCart}</div>` : ''}
            <div class="h-32 mb-4 flex items-center justify-center">
                <img src="${p.img}" class="max-h-full object-contain pointer-events-none drop-shadow-2xl transition duration-500 hover:scale-110">
            </div>
            <div class="text-[9px] text-blue-400 font-bold uppercase mb-1 tracking-[0.1em]">${p.category}</div>
            <h3 class="font-bold text-white text-[13px] mb-1 h-8 line-clamp-2 leading-tight">${p.name}</h3>
            <p class="text-slate-400 text-[11px] mb-4 line-clamp-2">${p.shortDesc}</p>
            <div class="flex justify-between items-center pt-3 border-t border-white/5 mt-auto">
                <span class="text-sm font-black text-white">${p.price.toLocaleString()} ₽</span>
                <div class="flex items-center gap-2">
                    ${inCart > 0 ? `
                        <button onclick="event.stopPropagation(); changeQty(${p.id}, -1)" class="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition">
                            <i class="fas fa-minus text-[8px]"></i>
                        </button>
                    ` : ''}
                    <button onclick="event.stopPropagation(); addToCart(${p.id})" class="bg-[#0070ba] text-white w-8 h-8 rounded-lg flex items-center justify-center hover:scale-110 active:scale-95 transition shadow-lg">
                        <i class="fas fa-plus text-[10px]"></i>
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');
}

// 4. ЛОГИКА КОРЗИНЫ
function updateUI() {
    const itemsDiv = document.getElementById('cart-items');
    let total = 0, count = 0;
    itemsDiv.innerHTML = '';
    
    for (let id in cart) {
        const item = cart[id];
        total += item.price * item.qty; count += item.qty;
        itemsDiv.innerHTML += `
            <div class="flex items-center gap-3 bg-white/95 p-3 rounded-2xl border border-white/10 shadow-xl">
                <img src="${item.img}" class="w-12 h-12 object-contain">
                <div class="flex-grow">
                    <div class="text-[11px] text-[#004a7c] font-extrabold line-clamp-1 uppercase tracking-tight">${item.name}</div>
                    <div class="text-[#0070ba] font-black text-xs">${item.price.toLocaleString()} ₽</div>
                </div>
                <div class="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-xl">
                    <button onclick="changeQty(${id},-1)" class="text-slate-400 hover:text-red-500 transition"><i class="fas fa-minus text-[10px]"></i></button>
                    <span class="font-bold text-slate-900 text-xs">${item.qty}</span>
                    <button onclick="changeQty(${id},1)" class="text-[#0070ba]"><i class="fas fa-plus text-[10px]"></i></button>
                </div>
            </div>`;
    }
    document.getElementById('cart-count').innerText = count;
    const totalElement = document.getElementById('total-price');
    if (totalElement) totalElement.innerText = total.toLocaleString() + ' ₽';
    if(count === 0) itemsDiv.innerHTML = '<div class="text-center py-20 text-slate-500 text-xs uppercase font-bold tracking-widest">Корзина пуста</div>';
}

function addToCart(id) {
    if (!cart[id]) cart[id] = { ...products.find(x => x.id === id), qty: 1 };
    else cart[id].qty++;
    save();
}

function changeQty(id, delta) {
    if (cart[id]) {
        cart[id].qty += delta;
        if (cart[id].qty <= 0) delete cart[id];
        save();
    }
}

function save() {
    localStorage.setItem('gp_premium_v9', JSON.stringify(cart));
    updateUI();
    renderProducts();
}

// 5. МОДАЛЬНОЕ ОКНО
function openProductModal(id) {
    const p = products.find(x => x.id === id);
    document.getElementById('modal-img').src = p.img;
    document.getElementById('modal-title').innerText = p.name;
    document.getElementById('modal-cat').innerText = p.category;
    document.getElementById('modal-desc-full').innerText = p.fullDesc;
    document.getElementById('modal-price').innerText = p.price.toLocaleString() + ' ₽';
    document.getElementById('modal-specs').innerHTML = Object.entries(p.specs).map(([k,v]) => `
        <div class="flex justify-between py-2 border-b border-white/5 text-[12px]"><span class="text-slate-400 uppercase tracking-tighter">${k}</span><span class="font-bold text-white">${v}</span></div>
    `).join('');
    document.getElementById('modal-add-btn').onclick = () => { addToCart(p.id); };
    document.getElementById('product-modal').classList.add('modal-active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() { 
    document.getElementById('product-modal').classList.remove('modal-active'); 
    document.body.style.overflow = 'auto'; 
}

function toggleCart() {
    const m = document.getElementById('cart-modal');
    const isHidden = m.classList.toggle('hidden');
    m.style.display = isHidden ? 'none' : 'flex';
}

// 6. ОФОРМЛЕНИЕ ЗАКАЗА + АНИМАЦИЯ + БОТ
async function checkoutTelegram() {
    if (Object.keys(cart).length === 0) return;

    // --- Визуальная анимация загрузки ---
    const checkoutBtn = document.querySelector('button[onclick="checkoutTelegram()"]');
    const originalContent = checkoutBtn.innerHTML;
    checkoutBtn.disabled = true;
    checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> ОТПРАВКА...';

    const overlay = document.createElement('div');
    overlay.className = "fixed inset-0 bg-[#0070ba] z-[500] flex items-center justify-center opacity-0 transition-opacity duration-500";
    overlay.innerHTML = '<div class="text-white text-center"><i class="fas fa-paper-plane text-5xl mb-4 animate-bounce"></i><br><span class="font-black italic uppercase tracking-tighter">Связь с менеджером...</span></div>';
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('opacity-100'), 10);

    // --- Сбор данных ---
    let total = document.getElementById('total-price').innerText;
    let orderDetails = "";
    for (let id in cart) {
        orderDetails += `• ${cart[id].name} — ${cart[id].qty} шт.\n`;
    }

    const orderMsg = `📦 <b>НОВЫЙ ЗАКАЗ С САЙТА</b>\n\n<b>Товары:</b>\n${orderDetails}\n💰 <b>Итого: ${total}</b>`;

    // Клавиатура для админ-панели в Telegram
    const adminKeyboard = {
        inline_keyboard: [
            [
                { text: "✅ Принять", callback_data: "accept" },
                { text: "❌ Отклонить", callback_data: "decline" }
            ],
            [
                { text: "💬 Написать клиенту", url: `https://t.me/${MANAGER_USERNAME}` }
            ]
        ]
    };

    try {
        // Уведомление менеджеру
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: ADMIN_CHAT_ID,
                text: orderMsg,
                parse_mode: 'HTML',
                reply_markup: adminKeyboard
            })
        });

        // Переход клиента
        setTimeout(() => {
            window.location.href = `https://t.me/${MANAGER_USERNAME}?text=${encodeURIComponent("Здравствуйте! Мой заказ:\n" + orderDetails + "\nСумма: " + total)}`;
        }, 1500);

    } catch (e) {
        console.error(e);
        alert("Ошибка отправки. Проверьте интернет.");
        checkoutBtn.disabled = false;
        checkoutBtn.innerHTML = originalContent;
        overlay.remove();
    }
}

// 7. СТАРТ
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateUI();
});
