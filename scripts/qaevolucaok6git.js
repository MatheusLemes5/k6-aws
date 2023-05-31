import { chromium } from 'k6/experimental/browser';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = {
    vus: 5,
    duration: '5s',
    thresholds: {
        checks: ["rate > 0.99"]
    }
};

const csvData = new SharedArray('Ler dados', function () {
    return papaparse.parse(open('dados/usuariosfm.csv'), { header: true }).data;
});

const USERS = csvData.map((row) => row.telephone);

export default async function () {
    const browser = chromium.launch({ headless: false });
    const context = browser.newContext();
    const page = context.newPage();

    try {
        const USER = USERS[__VU - 1]; 

        await page.goto('https://fatalmodel-automation.link/login', { waitUntil: 'networkidle' });

        console.log(USER)
        await Promise.all([
            // page.waitForTimeout(4000),
            page.waitForSelector('input[name="phone_email"]'),
            page.locator('input[name="phone_email"]').fill(`${USER}`),
            page.locator('input[name="password"]').fill('123456'),
        ]);
        
        await Promise.all([
            page.waitForNavigation(),
            page.locator('button[class="login__btn btn-primary"').click()
        ]);

        // check(page, {
        //      'Presença do Bem Vindo no painel': page.locator('h1[class="panel-container__ad-welcome"]').textContent().startsWith('Bem-vindo(a), '),
        // });

        sleep(1);

    } finally {
        page.close();
        browser.close();
    }
};

export function handleSummary(data) {
    return {
      "qaevolucao2.html": htmlReport(data),
    };
  }