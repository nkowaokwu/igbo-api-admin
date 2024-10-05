import React, { useState, ReactElement, useEffect } from 'react';
import { Hide } from '@chakra-ui/react';
import queryString from 'query-string';
import IgboSoundboxViews from 'src/shared/constants/IgboSoundboxViews';
import useBeforeWindowUnload from 'src/hooks/useBeforeWindowUnload';
import { ProjectContext } from 'src/App/contexts/ProjectContext';
import ProjectType from 'src/backend/shared/constants/ProjectType';
import RecordSentenceAudio from './RecordSentenceAudio';
import VerifySentenceAudio from './VerifySentenceAudio';
import TranslateSentences from './TranslateSentences';
import VerifyTranslateSentences from './VerifyTranslateSentences';
import IgboSoundboxNavbar from './components/Navbar';

const redirectHome = () => {
  window.location.href = '#/';
};

const IgboSoundboxRoute = ({
  view,
  currentView,
  projectTypes,
  projectType,
  children,
}: {
  view: IgboSoundboxViews;
  currentView: IgboSoundboxViews;
  projectTypes: ProjectType[];
  projectType: ProjectType;
  children: React.ReactElement;
}): ReactElement => {
  if (view !== currentView) {
    return null;
  }

  if (!projectTypes.includes(projectType)) {
    redirectHome();
    return <></>;
  }

  return React.cloneElement(children, {});
};

const routes = [
  {
    Component: RecordSentenceAudio,
    view: IgboSoundboxViews.RECORD,
    projectType: ProjectType.TEXT_AUDIO_ANNOTATION,
  },
  {
    Component: VerifySentenceAudio,
    view: IgboSoundboxViews.VERIFY,
    projectType: ProjectType.TEXT_AUDIO_ANNOTATION,
  },
  {
    Component: TranslateSentences,
    view: IgboSoundboxViews.TRANSLATE,
    projectType: ProjectType.TRANSLATION,
  },
  {
    Component: VerifyTranslateSentences,
    view: IgboSoundboxViews.TRANSLATE_VERIFY,
    projectType: ProjectType.TRANSLATION,
  },
];

const IgboSoundboxRouteManager = ({
  currentView,
  projectTypes,
  children,
}: {
  currentView: IgboSoundboxViews;
  projectTypes: ProjectType[];
  children: React.ReactElement[];
}) => React.Children.map(children, (child) => React.cloneElement(child, { currentView, projectTypes }));

const IgboSoundbox = (): ReactElement => {
  const [currentView, setCurrentView] = useState<IgboSoundboxViews>();
  const [isDirty, setIsDirty] = useState(false);
  const project = React.useContext(ProjectContext);

  useEffect(() => {
    setIsDirty(false);

    if (currentView === IgboSoundboxViews.HOME) {
      redirectHome();
    }
  }, [currentView]);

  useEffect(() => {
    const queries = window.location.href.split('?')[1];
    const { soundboxView } = queryString.parse(queries) || {};
    if (typeof soundboxView === 'string') {
      setCurrentView(soundboxView as IgboSoundboxViews);
    }
  }, []);

  useBeforeWindowUnload();

  return (
    <>
      <Hide below="md">
        <IgboSoundboxNavbar currentView={currentView} setCurrentView={setCurrentView} isDirty={isDirty} />
      </Hide>
      <IgboSoundboxRouteManager currentView={currentView} projectTypes={project.types}>
        {routes.map(({ Component, view, projectType }) => (
          <IgboSoundboxRoute key={view} view={view} projectType={projectType}>
            <Component setIsDirty={setIsDirty} />
          </IgboSoundboxRoute>
        ))}
      </IgboSoundboxRouteManager>
    </>
  );
};

export default IgboSoundbox;
