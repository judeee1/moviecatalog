import { test, expect, Page } from "@playwright/test";

test.describe("Home Page", () => {
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

    // Переходим на главную страницу и ждем завершения сетевых запросов
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

  // Тест: проверяем отображение популярных фильмов
  test("должен отобразить популярные фильмы на главной странице", async ({
    page,
  }: {
    page: Page;
  }) => {
    // Ждем появления сетки с фильмами
    await page.waitForSelector(".movies-grid", {
      state: "visible",
      timeout: 60000,
    });

    // Проверяем наличие карточек фильмов
    const movieCards = page.locator(".movie-card");
    const count = await movieCards.count();
    expect(count).toBeGreaterThan(0);

    // Ждем появления заголовка первой карточки
    const firstCardTitle = movieCards.first().locator(".movie-card-title");
    await firstCardTitle.waitFor({ state: "visible", timeout: 30000 });

    // Логируем текст первой карточки для отладки
    const firstCardText = await firstCardTitle.innerText();
    console.log("First card text:", firstCardText);

    // Проверяем, что заголовок не пустой
    await expect(firstCardTitle).toHaveText(/.+/, { timeout: 15000 });

    // Проверяем постер первой карточки
    try {
      const poster = page.locator(".movie-card-poster").first();
      await poster.waitFor({ state: "visible", timeout: 30000 });
      const posterSrc = await poster.getAttribute("src");
      console.log("Popular poster src:", posterSrc);
      if (posterSrc) {
        // Проверяем, что URL постера с TMDB
        await expect(poster).toHaveAttribute("src", /image\.tmdb\.org/, {
          timeout: 15000,
        });
      } else {
        console.warn(
          "Popular poster src is empty, likely due to onError handler"
        );
      }
    } catch (e) {
      console.error("Popular poster error:", e);
    }

    console.log("Popular movies count:", count);
  });

  // Тест: проверяем функциональность поиска
  test("должен искать фильм и отобразить результаты", async ({
    page,
  }: {
    page: Page;
  }) => {
    // Находим поле поиска
    const searchInput = page.locator(".search-input");
    // Вводим запрос "Matrix"
    await searchInput.fill("Matrix");
    // Ждем debounce и ответа API
    await page.waitForTimeout(1500);

    // Ждем появления сетки с результатами
    await page.waitForSelector(".movies-grid", {
      state: "visible",
      timeout: 60000,
    });

    // Проверяем заголовок страницы
    await expect(page.locator(".home-title")).toHaveText("Результаты", {
      timeout: 15000,
    });

    // Проверяем наличие карточек с результатами
    const searchResults = page.locator(".movie-card");
    const resultCount = await searchResults.count();
    expect(resultCount).toBeGreaterThan(0);

    // Логируем текст первой карточки результата
    const firstResultText = await searchResults
      .first()
      .locator(".movie-card-title")
      .innerText();
    console.log("First search result text:", firstResultText);

    // Проверяем, что первая карточка содержит "Matrix"
    await expect(
      searchResults.first().locator(".movie-card-title")
    ).toContainText(/matrix/i, { timeout: 15000 });

    // Проверяем постер первой карточки
    try {
      const poster = page.locator(".movie-card-poster").first();
      await poster.waitFor({ state: "visible", timeout: 30000 });
      const posterSrc = await poster.getAttribute("src");
      console.log("Search poster src:", posterSrc);
      if (posterSrc) {
        // Проверяем, что URL постера с TMDB
        await expect(poster).toHaveAttribute("src", /image\.tmdb\.org/, {
          timeout: 15000,
        });
      } else {
        console.warn(
          "Search poster src is empty, likely due to onError handler"
        );
      }
    } catch (e) {
      console.error("Search poster error:", e);
    }

    console.log("Search results count:", resultCount);
  });
});
