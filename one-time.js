const ONE_TIME_KEY = "karem-one-time-submitted";

function generateOneTimePassword() {
  const now = new Date();
  const base = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    hash = (hash * 31 + base.charCodeAt(i)) % 100000;
  }
  return String(hash).padStart(5, "0");
}

function renderLockedPage() {
  const appRoot = document.getElementById("appRoot");
  if (!appRoot) return;

  appRoot.innerHTML = `
    <section class="hero-card">
      <h1>التطبيق مغلق</h1>
      <p>هذا التطبيق تم استخدامه مرة واحدة بالفعل. كلمة السر الموجودة في الصفحة الرئيسية هي نفسها للاستخدام الآن.</p>
      <form id="unlockForm" class="card-form">
        <label>
          أدخل كلمة السر
          <input type="password" name="unlockPassword" placeholder="اكتب هنا" required />
        </label>
        <div class="form-actions">
          <button type="submit" class="primary-btn">فتح</button>
        </div>
        <p id="unlockMessage" class="filter-meta"></p>
      </form>
    </section>
  `;

  const unlockForm = document.getElementById("unlockForm");
  const unlockMessage = document.getElementById("unlockMessage");
  unlockForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(unlockForm);
    const password = formData.get("unlockPassword")?.toString().trim();
    if (password === generateOneTimePassword()) {
      localStorage.removeItem(ONE_TIME_KEY);
      renderFormPage();
      return;
    }
    if (unlockMessage) {
      unlockMessage.textContent = "كلمة السر غير صحيحة. حاول مرة أخرى.";
    }
  });
}

function renderFormPage() {
  document.getElementById("appRoot").innerHTML = `
    <section class="hero-card">
      <h1>أدخل بياناتك</h1>
      <p>هذا التطبيق يعمل مرة واحدة فقط. اكتب الاسم والعنوان ورقم الهاتف ثم اضغط تم.</p>
      <form id="oneTimeForm" class="card-form">
        <label>
          الاسم
          <input type="text" name="name" placeholder="اكتب الاسم" required />
        </label>
        <label>
          العنوان
          <input type="text" name="address" placeholder="اكتب العنوان" required />
        </label>
        <label>
          رقم الهاتف
          <input type="tel" name="phone" placeholder="اكتب رقم الهاتف" />
        </label>
        <label>
          فلتر
          <select name="filter">
            <option value="0">فلتر 1</option>
            <option value="1">فلتر 2</option>
            <option value="2">فلتر 3</option>
            <option value="3">فلتر 4</option>
            <option value="4">فلتر 5</option>
            <option value="5">فلتر 6</option>
            <option value="6">فلتر 7</option>
          </select>
        </label>
        <label>
          التاريخ
          <input type="date" name="startDate" required />
        </label>
        <div class="form-actions">
          <button type="submit" class="primary-btn">تم</button>
        </div>
      </form>
    </section>
  `;

  const form = document.getElementById("oneTimeForm");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = formData.get("name")?.toString().trim();
    const address = formData.get("address")?.toString().trim();
    const phone = formData.get("phone")?.toString().trim();
    const filter = Number(formData.get("filter") || 0);
    const startDate = formData.get("startDate")?.toString() || null;
    if (!name || !address || !startDate) return;

    const oneTimeData = {
      name,
      address,
      phone,
      filter,
      startDate,
      date: new Date().toISOString(),
    };
    localStorage.setItem(ONE_TIME_KEY, JSON.stringify(oneTimeData));

    const clientsJson = localStorage.getItem("clients-data");
    const clients = clientsJson ? JSON.parse(clientsJson) : [];
    clients.push({
      id: crypto.randomUUID(),
      name,
      address,
      phone,
      filter,
      startDate,
      notes: "",
      renewalDates: {},
      schedule: {},
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("clients-data", JSON.stringify(clients));

    document.body.innerHTML = `
      <div class="page-shell">
        <section class="hero-card">
          <h1>تم التسجيل</h1>
          <p>شكرًا. لقد تم حفظ البيانات وسيتم إضافتها كعميل في التطبيق الرئيسي.</p>
        </section>
      </div>
    `;
  });
}

function initOneTimeApp() {
  if (localStorage.getItem(ONE_TIME_KEY)) {
    renderLockedPage();
    return;
  }

  renderFormPage();
}

initOneTimeApp();
