import json
import logging
import os

from django.core.management.base import BaseCommand

from v1.models.browse_page import BrowsePage
from v1.tests.wagtail_pages.helpers import publish_changes


logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Monthly updates to data snapshot values'

    def expand_path(self, path):
        """Expands a relative path into an absolute path"""
        rootpath = os.path.abspath(os.path.expanduser(path))

        return rootpath

    def add_arguments(self, parser):
        """Adds all arguments to be processed."""
        parser.add_argument(
            '--snapshot_file',
            required=True,
            help='JSON file containing all markets\' data snapshot values'
        )

    def update_chart_blocks(self, date_published, last_updated):
        """ Update date_published on all chart blocks """
        for page in BrowsePage.objects.all():
            chart_blocks = filter(
                lambda item: item['type'] == 'chart_block',
                page.specific.content.stream_data
            )
            if not chart_blocks:
                continue
            for chart in chart_blocks:
                chart['value']['date_published'] = date_published
                chart['value']['last_updated_projected_data'] = last_updated
            publish_changes(page.specific)

    def handle(self, *args, **options):
        # Read in CCT snapshot data from json file
        with open(self.expand_path(options['snapshot_file'])) as json_data:
            data = json.load(json_data)

        date_published = data['date_published']
        last_updated = max(
            [item['data_month'] for item in data['markets']]
        )

        self.update_chart_blocks(date_published, last_updated)
