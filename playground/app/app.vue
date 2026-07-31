<template>
    <div>
        <NuxtRouteAnnouncer />
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>

        <!-- Blocks every route while tenant / domain / clientId are unset. -->
        <PxConfigOverlay />
    </div>
</template>
