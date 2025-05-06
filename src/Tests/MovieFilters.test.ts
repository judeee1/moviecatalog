import { test, expect, Page } from "@playwright/test";

test.describe("Filters", () => {
  // Настройка перед каждым тестом: очистка хранилища и логирование
  test.beforeEach(async ({ page, context }) => {
    // Очищаем cookies для чистого состояния
    await context.clearCookies();
    // Очищаем localStorage через скрипт
    await context.addInitScript(() => {
      try {
        window.localStorage.clear();
      } catch (e) {
        console.warn("Failed to clear localStorage:", e);
      }
    });

    // Логируем сетевые запросы и ответы для отладки
    page.on("request", (request) => console.log(`Request: ${request.url()}`));
    page.on("response", (response) =>
      console.log(`Response: ${response.url()} - ${response.status()}`)
    );
    // Логируем сообщения консоли браузера
    page.on("console", (msg) => console.log(`Browser console: ${msg.text()}`));

    // Переходим на главную страницу
    await page.goto("http://localhost:5173", {
      waitUntil: "networkidle",
      timeout: 120000,
    });
  });

  // Снимаем скриншот в случае провала теста
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== "passed") {
      await page.screenshot({ path: `screenshots/${testInfo.title}.png` });
    }
  });

  // Тест: проверяем фильтрацию фильмов
  test("должен фильтровать фильмы по жанру, году и рейтингу", async ({
    page,
  }: {
    page: Page;
  }) => {
    // Открываем панель фильтров
    const toggleFiltersButton = page.locator(".toggle-filters-button");
    await toggleFiltersButton.waitFor({ state: "visible", timeout: 30000 });
    await toggleFiltersButton.click();
    await page.waitForSelector(".movie-filters.visible", {
      state: "visible",
      timeout: 15000,
    });
    console.log("Filters form is visible");

    // Заполняем поля фильтров
    const genreSelect = page.locator("#genre");
    const yearInput = page.locator("#year");
    const ratingInput = page.locator("#rating");
    await genreSelect.selectOption("28"); // Выбираем жанр "Экшен"
    await yearInput.fill("2020"); // Устанавливаем год
    await ratingInput.fill("7.0"); // Устанавливаем рейтинг
    console.log("Filters filled: genre=Action, year=2020, rating=7.0");

    // Применяем фильтры
    const applyButton = page.locator(".filter-button");
    await applyButton.click();
    await page.waitForTimeout(1500); // Ждем загрузки результатов

    // Проверяем отображение результатов
    await page.waitForSelector(".movies-grid", {
      state: "visible",
      timeout: 60000,
    });
    const filteredMovies = page.locator(".movie-card");
    const filteredCount = await filteredMovies.count();
    expect(filteredCount).toBeGreaterThan(0);
    console.log("Filtered movies count:", filteredCount);

    // Проверяем заголовок страницы
    await expect(page.locator(".home-title")).toHaveText("Результаты", {
      timeout: 15000,
    });

    // Сбрасываем фильтры
    const resetButton = page.locator(".reset-button");
    await resetButton.click();
    await page.waitForTimeout(1500);

    // Проверяем возврат к популярным фильмам
    await expect(page.locator(".home-title")).toHaveText("Популярные фильмы", {
      timeout: 15000,
    });
    const popularMovies = page.locator(".movie-card");
    expect(await popularMovies.count()).toBeGreaterThan(0);
    console.log("Filters reset, showing popular movies");
  });
});
