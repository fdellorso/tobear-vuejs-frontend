<template>
  <div class="mx-auto max-w-2xl px-4 py-8 min-h-screen">
    <div class="mb-8 text-center">
      <h1 class="text-2xl font-semibold text-tb-text">{{ $t('premium.title') }}</h1>
      <p class="mt-2 text-sm text-tb-text-muted">
        {{ $t('premium.subtitle') }}
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <div class="rounded-xl border border-tb-border bg-tb-surface p-6">
        <h2 class="text-lg font-semibold text-tb-text">{{ $t('premium.classic') }}</h2>
        <p class="mt-1 text-2xl font-bold text-tb-accent">
          €2.99<span class="text-sm font-normal text-tb-text-muted">{{
            $t('premium.perMonth')
          }}</span>
        </p>
        <ul class="mt-4 space-y-2 text-sm text-tb-text-sec">
          <li>✓ {{ $t('premium.classicFeatures.sync') }}</li>
          <li>✓ {{ $t('premium.classicFeatures.backup') }}</li>
          <li>✓ {{ $t('premium.classicFeatures.updates') }}</li>
        </ul>
      </div>

      <div class="rounded-xl border border-tb-accent bg-tb-surface p-6">
        <h2 class="text-lg font-semibold text-tb-text">{{ $t('premium.reels') }}</h2>
        <p class="mt-1 text-2xl font-bold text-tb-accent">
          €4.99<span class="text-sm font-normal text-tb-text-muted">{{
            $t('premium.perMonth')
          }}</span>
        </p>
        <ul class="mt-4 space-y-2 text-sm text-tb-text-sec">
          <li>✓ {{ $t('premium.reelsFeatures.everything') }}</li>
          <li>✓ {{ $t('premium.reelsFeatures.photos') }}</li>
          <li>✓ {{ $t('premium.reelsFeatures.storage') }}</li>
        </ul>
      </div>
    </div>

    <p class="mt-8 text-center text-xs text-tb-text-muted">
      {{ $t('premium.comingSoon') }}
    </p>
  </div>
</template>

<script setup></script>
