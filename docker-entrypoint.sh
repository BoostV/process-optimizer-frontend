#!/bin/bash
set -e

if [[ -d "/usr/share/nginx/html" ]]
then
    find /usr/share/nginx/html -name '*.js' -exec sh -c "sed -e \"s^http://localhost:9090/v1.0^${API_URL}^g\" {} > /tmp/tmp_replace && mv /tmp/tmp_replace {}" \; 
fi

exec "$@"