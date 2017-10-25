rmdir /S/Q output
mkdir output

for /r src %%a in (*.d.ts) do (
    echo: >> output\taffy.d.ts
    echo // %%a >> output\taffy.d.ts
    type "%%a" >> output\taffy.d.ts
)

for /r src %%a in (*.js) do (
    echo: >> output\taffy.js
    echo // %%a >> output\taffy.js
    type "%%a"  >> output\taffy.js
)

call uglifyjs output\taffy.js -o output\taffy.min.js -c -m
