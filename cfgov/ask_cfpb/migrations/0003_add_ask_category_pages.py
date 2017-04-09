# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion
import v1.atomic_elements.atoms
import wagtail.wagtailcore.fields
import wagtail.wagtailcore.blocks


class Migration(migrations.Migration):

    dependencies = [
        ('v1', '0059_alj_filterable_list'),
        ('ask_cfpb', '0002_answerpage_redirect_id'),
    ]

    operations = [
        migrations.CreateModel(
            name='AnswerCategoryPage',
            fields=[
                ('cfgovpage_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='v1.CFGOVPage')),
            ],
            options={
                'abstract': False,
            },
            bases=('v1.cfgovpage',),
        ),
        migrations.CreateModel(
            name='AnswerLandingPage',
            fields=[
                ('landingpage_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='v1.LandingPage')),
                ('cards', wagtail.wagtailcore.fields.StreamField([('cards', wagtail.wagtailcore.blocks.StructBlock([(b'limit', v1.atomic_elements.atoms.IntegerBlock(help_text=b'Limit list to this number of items', default=5, min_value=0, label=b'Maximum items'))]))], blank=True)),
            ],
            options={
                'abstract': False,
            },
            bases=('v1.landingpage',),
        ),
        migrations.RemoveField(
            model_name='category',
            name='featured_questions',
        ),
        migrations.RemoveField(
            model_name='subcategory',
            name='featured',
        ),
        migrations.AddField(
            model_name='answer',
            name='featured',
            field=models.BooleanField(default=False, help_text='Makes the answer available to cards on the landing page'),
        ),
        migrations.AddField(
            model_name='answer',
            name='featured_rank',
            field=models.IntegerField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='subcategory',
            name='parent',
            field=models.ForeignKey(related_name='subcategories', default=None, blank=True, to='ask_cfpb.Category', null=True),
        ),
        migrations.AddField(
            model_name='answercategorypage',
            name='ask_category',
            field=models.ForeignKey(related_name='category_page', on_delete=django.db.models.deletion.PROTECT, blank=True, to='ask_cfpb.Category', null=True),
        ),
    ]
