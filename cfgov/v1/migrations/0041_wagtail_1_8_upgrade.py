# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('v1', '0040_fill_filter_spec'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cfgovrendition',
            name='filter_spec',
            field=models.CharField(max_length=255, db_index=True),
        ),
        migrations.AlterUniqueTogether(
            name='cfgovrendition',
            unique_together=set([('image', 'filter_spec', 'focal_point_key')]),
        ),
    ]
