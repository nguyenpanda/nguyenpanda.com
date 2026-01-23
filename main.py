from src.nguyenpanda_com import (
    FileHandler, 
    Configure,
    Logger,
)

from PandaHttpd import http, PandaHttpd, StaticFiles
from PandaHttpd.middleware import GZipMiddleware
from pathlib import Path


panda_config = Configure('./config/config.yaml')
config = panda_config.get()

server_config = config['server']
server_config['mount'] = {k: Path(v) for k, v in server_config['mount'].items()}
mount_config = server_config['mount']

app = PandaHttpd(
    config=server_config,
    logger=Logger(config['logger']),
    middleware=[GZipMiddleware()],
)
app.logger.info(f'Loading `Configure` from `{Path(panda_config.conf_path).absolute()}`')


@app.set_default_handler
def error404() -> http.HtmlResponse:
    return http.HtmlResponse(
        status_code=http.HttpStatus.NOT_FOUND,
        body=file_handler.serve_file(mount_config['errors'] / '404.html'),
    )
   
    
@app.route('/', 'GET', response_class=http.HtmlResponse)
def home():
    return file_handler.serve_file(mount_config['pages'] / 'home.html')


@app.route('/research', 'GET', response_class=http.HtmlResponse)
def research():
    return file_handler.serve_file(mount_config['pages'] / 'research.html')


@app.route('/projects', 'GET', response_class=http.HtmlResponse)
def projects():
    return file_handler.serve_file(mount_config['pages'] / 'projects.html')


@app.route('/hpc', 'GET', response_class=http.HtmlResponse)
def hpc():
    return file_handler.serve_file(mount_config['pages'] / 'hpc.html')


@app.route('/gallery', 'GET', response_class=http.HtmlResponse)
def gallery():
    return file_handler.serve_file(mount_config['pages'] / 'gallery.html')


@app.route('/archive', 'GET', response_class=http.HtmlResponse)
def archive():
    return file_handler.serve_file(mount_config['pages'] / 'archive.html')


@app.route('/portal', 'GET', response_class=http.HtmlResponse)
def portal():
    return file_handler.serve_file(mount_config['pages'] / 'portal.html')


@app.route('/about', 'GET', response_class=http.HtmlResponse)
def about() -> bytes:
    return file_handler.serve_file(mount_config['pages'] / 'about.html')


@app.route('/home', 'GET', response_class=http.RedirectResponse)
def redirected_home(): 
    return {
        'Location': config['root_url'] + '/',
        'status_code': http.HttpStatus.MOVED_PERMANENTLY,
    }
    

@app.route('/redirected2', 'GET')
def redirected2(): 
    return http.RedirectResponse(
        url=config['root_url'] + '/public/images/nguyenpanda/svg/nguyenpanda.svg',
        status_code=http.HttpStatus.MOVED_PERMANENTLY,
    )
    

@app.route('/phuongdoan', 'GET', response_class=http.HtmlResponse)
def phuongdoan():
    return file_handler.serve_file(mount_config['pages'] / 'phuongdoan.html')
    

app.mount('/public', handler=StaticFiles(directory=mount_config['public']))
        

if __name__ == '__main__':
    file_handler = FileHandler(default_files=mount_config['errors'] / '404.html')

    app.logger.debug('Starting PandaHttpd Server...')
    app.logger.save(config['logger']['config_file'], panda_config.yaml())
    app.logger.debug('Panda configuration loaded successfully.')
    app.logger.debug(str(app.router))
    app.run()
