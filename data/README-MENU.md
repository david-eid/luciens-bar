# Editing the menus

The menu data is split into JSON files so it can be updated without touching site code.

## Drinks menu
- Open: `/data/drinks-menu.json`
- Structure: `categories` -> `subcategories` -> `items`
- Display order: Cocktails, Cocktail Trees, Wine & Fizz, Beers & Ale, Mocktails, Non-Alcoholic Drinks
- Each item can include `name`, `price`, `description`, `prices`, `tags`, and optional `note`
- If an item has `prices`, those appear as a price table with the column names supplied in `priceColumns`
- Tags are automatically shown as small gold badges beside the item name

## Food menu
- Open: `/data/food-menu.json`
- Structure: `categories` -> `items`
- Use the exact category order shown in the file: Lite Bites, Hot Wraps, Salads, Sides, Burgers, Pizzas, Kid's Menu
- Each item can include `name`, `price`, `prices`, `description`, and optional `note`
- Entries with `prices` render side-by-side as paired option labels and values
- Vegetarian dishes are marked with a small `V` badge automatically if the name includes `(V)`
- Category notes are shown as a small gold banner under the section title

Example:

```json
{
  "name": "Nachos",
  "prices": [{ "label": "Single", "value": "£6.95" }, { "label": "Sharing", "value": "£10.95" }],
  "description": "Tortilla chips topped with mozzarella cheese, jalapeños, sour cream, guacamole & salsa"
}
```

To change text, pricing, or add a new section, edit the values in these files and refresh the page.
