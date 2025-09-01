from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model


User = get_user_model()


@receiver(post_save, sender=User)
def set_default_name(sender, instance, created, **kwargs):
    if created and not instance.name:
        instance.name = instance.username
        instance.save(update_fields=['name'])