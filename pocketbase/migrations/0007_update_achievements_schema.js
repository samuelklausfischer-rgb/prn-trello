migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('achievements')

    const fields = [
      new TextField({ name: 'name', required: true }),
      new TextField({ name: 'slug', required: true }),
      new TextField({ name: 'description', required: true }),
      new TextField({ name: 'icon', required: true }),
      new TextField({ name: 'requirement_type', required: true }),
      new NumberField({ name: 'requirement_value', required: true }),
      new NumberField({ name: 'points_reward' }),
      new NumberField({ name: 'xp_reward' }),
      new TextField({ name: 'badge_color' }),
      new SelectField({
        name: 'rarity',
        values: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
        maxSelect: 1,
      }),
      new BoolField({ name: 'is_active' }),
      new BoolField({ name: 'is_hidden' }),
    ]

    fields.forEach((field) => {
      if (!col.fields.getByName(field.name)) {
        col.fields.add(field)
      }
    })

    try {
      col.addIndex('idx_achievements_slug', true, 'slug', '')
    } catch (e) {}
    try {
      col.addIndex('idx_achievements_category', false, 'category', '')
    } catch (e) {}

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('achievements')
    const fieldsToRemove = [
      'name',
      'slug',
      'description',
      'icon',
      'requirement_type',
      'requirement_value',
      'points_reward',
      'xp_reward',
      'badge_color',
      'rarity',
      'is_active',
      'is_hidden',
    ]

    fieldsToRemove.forEach((name) => {
      if (col.fields.getByName(name)) {
        col.fields.removeByName(name)
      }
    })

    try {
      col.removeIndex('idx_achievements_slug')
    } catch (e) {}
    try {
      col.removeIndex('idx_achievements_category')
    } catch (e) {}

    app.save(col)
  },
)
