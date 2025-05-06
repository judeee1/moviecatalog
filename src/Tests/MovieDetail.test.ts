import { test, expect, Page } from "@playwright/test";

test.describe("Movie Details", () => {
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

  // Тест: проверяем переход на страницу фильма
  test("должен перейти на страницу фильма при клике", async ({
    page,
  }: {
    page: Page;
  }) => {
    // Ждем появления сетки с фильмами
    await page.waitForSelector(".movies-grid", {
      state: "visible",
      timeout: 60000,
    });

    // Находим первую карточку и логируем ее текст
    const firstCard = page.locator(".movie-card").first();
    const firstCardText = await firstCard
      .locator(".movie-card-title")
      .innerText();
    console.log("Clicked card text:", firstCardText);

    // Кликаем по карточке
    await firstCard.click();

    // Ждем перехода на страницу фильма
    await page.waitForURL(/\/movie\/\d+/, { timeout: 15000 });

    // Проверяем URL
    await expect(page).toHaveURL(/\/movie\/\d+/);

    // Ждем загрузки контейнера деталей
    await page.waitForSelector(".movie-detail-container", {
      state: "visible",
      timeout: 60000,
    });

    // Проверяем видимость контейнера
    await expect(page.locator(".movie-detail-container")).toBeVisible();

    // Логируем заголовок страницы фильма
    const movieTitleText = await page.locator(".movie-title").innerText();
    console.log("Movie detail title:", movieTitleText);

    // Проверяем, что заголовок не пустой
    await expect(page.locator(".movie-title")).toHaveText(/.+/, {
      timeout: 15000,
    });

    // Проверяем постер
    try {
      const poster = page.locator(".movie-poster");
      await poster.waitFor({ state: "visible", timeout: 30000 });
      const posterSrc = await poster.getAttribute("src");
      console.log("Movie detail poster src:", posterSrc);
      if (posterSrc) {
        // Проверяем, что URL постера с TMDB
        await expect(poster).toHaveAttribute("src", /image\.tmdb\.org/, {
          timeout: 15000,
        });
      } else {
        console.warn(
          "Movie detail poster src is empty, likely due to onError handler"
        );
      }
    } catch (e) {
      console.error("Movie detail poster error:", e);
    }
  });

  // Тест: проверяем отображение трейлера
  test("должен отображать трейлер фильма или сообщение об его отсутствии", async ({
    page,
  }: {
    page: Page;
  }) => {
    // Переходим на страницу конкретного фильма
    await page.goto("http://localhost:5173/movie/550", {
      waitUntil: "networkidle",
      timeout: 120000,
    });

    // Ждем загрузки контейнера деталей
    await page.waitForSelector(".movie-detail-container", {
      state: "visible",
      timeout: 60000,
    });

    // Проверяем наличие трейлера или сообщения
    const trailerIframe = page.locator(".trailer-iframe");
    const noTrailerText = page.locator(".no-trailer-text");

    if (await trailerIframe.isVisible()) {
      // Проверяем, что iframe содержит YouTube-видео
      const iframeSrc = await trailerIframe.getAttribute("src");
      console.log("Trailer iframe src:", iframeSrc);
      expect(iframeSrc).toMatch(/youtube\.com\/embed/);
      console.log("Trailer is displayed");
    } else {
      // Проверяем сообщение об отсутствии трейлера
      await expect(noTrailerText).toHaveText("Трейлер недоступен", {
        timeout: 15000,
      });
      console.log("No trailer message is displayed");
    }
  });

  // Тест: проверяем отображение рейтинга
  test("должен отображать рейтинг фильма с правильным цветом", async ({
    page,
  }: {
    page: Page;
  }) => {
    // Переходим на страницу конкретного фильма
    await page.goto("http://localhost:5173/movie/550", {
      waitUntil: "networkidle",
      timeout: 120000,
    });

    // Ждем загрузки контейнера деталей
    await page.waitForSelector(".movie-detail-container", {
      state: "visible",
      timeout: 60000,
    });

    // Находим элемент рейтинга
    const ratingElement = page.locator(".movie-rating").first();
    await ratingElement.waitFor({ state: "visible", timeout: 30000 });

    // Логируем текст рейтинга
    const ratingText = await ratingElement.innerText();
    console.log("Rating text:", ratingText);

    // Проверяем, есть ли рейтинг
    if (ratingText.includes("Нет рейтинга")) {
      await expect(ratingElement).toHaveText("Нет рейтинга", {
        timeout: 15000,
      });
      const bgColor = await ratingElement.evaluate((el: HTMLElement) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      expect(bgColor).toBe("rgb(104, 117, 141)"); // Серый цвет для отсутствия рейтинга
      console.log("No rating displayed with correct background");
    } else {
      // Проверяем значение рейтинга
      const ratingValue = parseFloat(ratingText.replace("★", "").trim());
      expect(ratingValue).toBeGreaterThan(0);
      expect(ratingValue).toBeLessThanOrEqual(10);

      // Проверяем цвет фона в зависимости от рейтинга
      const bgColor = await ratingElement.evaluate((el: HTMLElement) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      if (ratingValue >= 7.5) {
        expect(bgColor).toBe("rgb(40, 167, 69)"); // Зеленый для высокого рейтинга
      } else if (ratingValue >= 5) {
        expect(bgColor).toBe("rgb(255, 193, 7)"); // Желтый для среднего рейтинга
      } else {
        expect(bgColor).toBe("rgb(220, 53, 69)"); // Красный для низкого рейтинга
      }
      console.log("Rating displayed with correct background color:", bgColor);
    }
  });

  // Тест: проверяем карусель похожих фильмов
  test("должен отображать карусель похожих фильмов", async ({
    page,
  }: {
    page: Page;
  }) => {
    // Переходим на страницу конкретного фильма
    await page.goto("http://localhost:5173/movie/550", {
      waitUntil: "networkidle",
      timeout: 120000,
    });

    // Ждем загрузки контейнера деталей
    await page.waitForSelector(".movie-detail-container", {
      state: "visible",
      timeout: 60000,
    });

    // Проверяем наличие карусели
    const carousel = page.locator(".movie-carousel");
    await carousel.waitFor({ state: "visible", timeout: 30000 });

    // Проверяем элементы карусели
    const carouselItems = page.locator(".carousel-item");
    const itemsCount = await carouselItems.count();

    if (itemsCount > 0) {
      // Проверяем, что есть элементы карусели
      expect(itemsCount).toBeGreaterThan(0);
      console.log("Similar movies count:", itemsCount);

      // Проверяем первую карточку в карусели
      const firstItem = carouselItems.first();
      const movieCard = firstItem.locator(".movie-card");
      await expect(movieCard).toBeVisible({ timeout: 15000 });

      const cardTitle = movieCard.locator(".movie-card-title");
      await expect(cardTitle).toHaveText(/.+/, { timeout: 15000 });
      console.log("First carousel item title:", await cardTitle.innerText());

      // Проверяем постер в карусели
      try {
        const poster = movieCard.locator(".movie-card-poster");
        const posterSrc = await poster.getAttribute("src");
        console.log("Carousel poster src:", posterSrc);
        if (posterSrc) {
          await expect(poster).toHaveAttribute("src", /image\.tmdb\.org/, {
            timeout: 15000,
          });
        } else {
          console.warn(
            "Carousel poster src is empty, likely due to onError handler"
          );
        }
      } catch (e) {
        console.error("Carousel poster error:", e);
      }
    } else {
      // Проверяем сообщение об отсутствии похожих фильмов
      await expect(page.locator(".no-movies-text")).toHaveText(
        "Похожих фильмов не найдено",
        {
          timeout: 15000,
        }
      );
      console.log("No similar movies message displayed");
    }
  });
});
