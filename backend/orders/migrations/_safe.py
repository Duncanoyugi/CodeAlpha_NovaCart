"""Helpers that make historical hot-fix migrations safe on *any* database state.

Several early migrations re-added columns that ``0001_initial`` already creates (they
were written to patch a drifted production database). Running them on a fresh database
crashed with "duplicate column". ``AddFieldIfMissing`` keeps the history intact for
databases that already applied it, while letting brand-new databases migrate cleanly.
"""
from django.db import migrations


class AddFieldIfMissing(migrations.AddField):
    def _exists(self, schema_editor, model):
        table = model._meta.db_table
        column = model._meta.get_field(self.name).column
        with schema_editor.connection.cursor() as cursor:
            columns = {
                c.name for c in schema_editor.connection.introspection.get_table_description(cursor, table)
            }
        return column in columns

    def database_forwards(self, app_label, schema_editor, from_state, to_state):
        model = to_state.apps.get_model(app_label, self.model_name)
        if self._exists(schema_editor, model):
            return
        super().database_forwards(app_label, schema_editor, from_state, to_state)

    def database_backwards(self, app_label, schema_editor, from_state, to_state):
        model = from_state.apps.get_model(app_label, self.model_name)
        if self._exists(schema_editor, model):
            super().database_backwards(app_label, schema_editor, from_state, to_state)


def postgres_only_sql(sql, reverse_sql=''):
    """RunPython that executes raw PostgreSQL only when the backend is PostgreSQL."""
    def forwards(apps, schema_editor):
        if schema_editor.connection.vendor == 'postgresql':
            schema_editor.execute(sql)

    def backwards(apps, schema_editor):
        if reverse_sql and schema_editor.connection.vendor == 'postgresql':
            schema_editor.execute(reverse_sql)

    return migrations.RunPython(forwards, backwards)
