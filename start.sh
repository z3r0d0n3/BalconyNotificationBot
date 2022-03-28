# nohup ./start.sh > output.log &
until node bot.js; do
    echo "Notification bot crashed with exit code $?.  Respawning.." >&2
    sleep 3
done