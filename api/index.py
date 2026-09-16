import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from python_service.app import app as flask_app

def app(environ, start_response):
    # Vercel splits the URL into SCRIPT_NAME and PATH_INFO. 
    # Since our Flask routes include '/api', we recombine them.
    script_name = environ.get('SCRIPT_NAME', '')
    path_info = environ.get('PATH_INFO', '')
    
    environ['PATH_INFO'] = script_name + path_info
    environ['SCRIPT_NAME'] = ''
    
    return flask_app(environ, start_response)
