const {test, expect} = require('@playwright/test');

test('exécuter, corriger et retrouver la progression', async ({page}) => {
  await page.goto('/');
  const editor = page.getByRole('textbox', {name: 'Éditeur SQL'});
  await editor.fill('SELECT Type FROM VEHICULE;');
  await page.getByRole('button', {name: 'Vérifier ma réponse'}).click();
  await expect(page.getByRole('status')).toContainText('Nombre de colonnes différent');
  await editor.fill('SELECT * FROM VEHICULE;');
  await page.getByRole('button', {name: 'Vérifier ma réponse'}).click();
  await expect(page.getByRole('status')).toContainText('Exercice validé');
  await expect(page.locator('#output tbody tr')).toHaveCount(15);
  await page.reload();
  await expect(editor).toHaveValue('SELECT * FROM VEHICULE;');
  await expect(page.locator('#progress')).toHaveJSProperty('value', 1);
  await expect(page.getByText('2 tentative(s)')).toBeVisible();
  expect(await page.locator('body').evaluate(body => body.scrollWidth <= window.innerWidth)).toBeTruthy();
  await expect(page.getByRole('link', {name: /administration|enseignant/i})).toHaveCount(0);
});
test('explorer la base et reprendre une requête libre', async ({page}) => {
  await page.goto('/');
  await page.getByRole('link', {name: 'Explorer la base', exact: true}).click();
  await page.getByRole('button', {name: /^PLAQUE/}).click();
  await expect(page.getByText('01/10/2005')).toBeVisible();
  await page.getByRole('link', {name: 'SQL libre', exact: true}).click();
  await page.getByRole('textbox', {name: 'Éditeur SQL'}).fill('SELECT COUNT(*) FROM PLAQUE;');
  await page.getByRole('button', {name: 'Enregistrer la requête'}).click();
  await page.reload();
  await page.getByRole('button', {name: /^1\. SELECT COUNT/}).click();
  await page.getByRole('button', {name: 'Exécuter', exact: true}).click();
  await expect(page.locator('#output tbody td')).toHaveText('8');
});
