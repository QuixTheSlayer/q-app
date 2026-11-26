

 @php
    $base = 'js/landing-page-builder';
    $marker = public_path("$base/current.txt");
    $dir = is_file($marker) ? trim(file_get_contents($marker)) : null;

    if (! $dir || ! preg_match('/^[a-z0-9-]+$/', $dir) || ! is_file(public_path("$base/$dir/index.js"))) {
        // Fallback: newest build folder (IDs sort by their timestamp prefix)
        $dir = collect(glob(public_path("$base/*"), GLOB_ONLYDIR))
            ->map(fn ($p) => basename($p))
            ->filter(fn ($n) => is_file(public_path("$base/$n/index.js")))
            ->sort()
            ->last();
    }

    if (! $dir) {
        report(new RuntimeException('Landing page builder build not found'));
    }
@endphp

@if ($dir)
    <link rel="stylesheet" crossorigin href="{{ asset("$base/$dir/style.css") }}">
    <script type="module" crossorigin src="{{ asset("$base/$dir/index.js") }}"></script>
@endif



<div id="landing-page-builder"></div>